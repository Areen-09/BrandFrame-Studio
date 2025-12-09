"""
Template Agent - LangGraph workflow for template-based poster generation

This agent takes a template ID and brandkit, then:
1. Fetches brand data from Firestore
2. Loads the template definition
3. Generates text content using Gemini 2.5 Flash
4. Fills placeholders with brand data and generated content
5. Returns canvas-ready JSON for all 3 formats
"""

import os
import json
import re
from typing import TypedDict, Dict, Any, List, Optional
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from pathlib import Path

from app.service.brand_service import brand_service
from app.core.config import settings


# Template directory path
TEMPLATES_DIR = Path(__file__).parent.parent.parent / "data" / "templates"


class TemplateState(TypedDict):
    user_id: str
    brandkit_id: str
    template_id: str
    brand_data: Dict[str, Any]
    template_def: Dict[str, Any]
    generated_texts: Dict[str, str]
    filled_templates: Dict[str, Any]  # Contains all 3 formats
    status: str
    error: Optional[str]


def fetch_brand_data(state: TemplateState) -> Dict[str, Any]:
    """Fetch brandkit data from Firestore"""
    print(f"[Template Agent] Fetching brand data for {state['brandkit_id']} (User: {state['user_id']})")
    
    try:
        doc_ref = brand_service.db.collection('users').document(state['user_id']).collection('brandkits').document(state['brandkit_id'])
        doc = doc_ref.get()
        
        if doc.exists:
            brand_data = doc.to_dict()
            print(f"[Template Agent] Found brandkit: {brand_data.get('name', 'Unknown')}")
        else:
            print(f"[Template Agent] BrandKit not found. Using fallback.")
            brand_data = brand_service.get_brandkit(state['brandkit_id'])
            
        return {"brand_data": brand_data}
        
    except Exception as e:
        print(f"[Template Agent] Error fetching brand data: {e}")
        return {
            "brand_data": brand_service.get_brandkit(state['brandkit_id']),
            "error": str(e)
        }


def load_template(state: TemplateState) -> Dict[str, Any]:
    """Load template definition from JSON file"""
    template_id = state['template_id']
    print(f"[Template Agent] Loading template: {template_id}")
    
    template_path = TEMPLATES_DIR / f"{template_id}.json"
    
    try:
        if not template_path.exists():
            print(f"[Template Agent] Template file not found: {template_path}")
            return {
                "template_def": {},
                "status": "failed",
                "error": f"Template not found: {template_id}"
            }
        
        with open(template_path, 'r', encoding='utf-8') as f:
            template_def = json.load(f)
        
        print(f"[Template Agent] Loaded template: {template_def.get('name', 'Unknown')}")
        return {"template_def": template_def}
        
    except Exception as e:
        print(f"[Template Agent] Error loading template: {e}")
        return {
            "template_def": {},
            "status": "failed",
            "error": str(e)
        }


def generate_texts(state: TemplateState) -> Dict[str, Any]:
    """Generate text content using Gemini 2.5 Flash for elements with prompts"""
    print("[Template Agent] Generating text content with Gemini 2.5 Flash...")
    
    template_def = state.get('template_def', {})
    brand_data = state.get('brand_data', {})
    
    if not template_def:
        return {"generated_texts": {}, "error": "No template definition available"}
    
    # Collect all text elements with prompts from all formats
    text_prompts = {}
    
    for format_key, format_def in template_def.get('formats', {}).items():
        for element in format_def.get('elements', []):
            if element.get('type') == 'text' and 'prompt' in element:
                role = element.get('role')
                if role and role not in text_prompts:
                    text_prompts[role] = element['prompt']
    
    if not text_prompts:
        print("[Template Agent] No text prompts found in template")
        return {"generated_texts": {}}
    
    # Generate all texts at once for efficiency
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.7,
            google_api_key=settings.GOOGLE_API_KEY
        )
        
        brand_name = brand_data.get('name', 'Brand')
        brand_tone = brand_data.get('tone', 'Professional')
        brand_style = brand_data.get('style', 'Modern')
        
        # Build a batch prompt
        prompt_list = "\n".join([
            f"- {role}: {prompt.replace('{{brand_name}}', brand_name)}"
            for role, prompt in text_prompts.items()
        ])
        
        system_prompt = f"""You are a creative copywriter for {brand_name}.
Brand tone: {brand_tone}
Brand style: {brand_style}

Generate marketing copy for each of the following elements. 
Return your response as a JSON object with the role name as key and generated text as value.
Be concise and impactful. Follow the specific instructions for each element.

Elements to generate:
{prompt_list}

Return ONLY valid JSON, no markdown, no explanation."""

        response = llm.invoke([HumanMessage(content=system_prompt)])
        
        # Parse the response
        response_text = response.content.strip()
        
        # Clean up the response if it has markdown code blocks
        if response_text.startswith('```'):
            response_text = re.sub(r'^```json?\s*', '', response_text)
            response_text = re.sub(r'\s*```$', '', response_text)
        
        try:
            generated_texts = json.loads(response_text)
            print(f"[Template Agent] Generated {len(generated_texts)} text elements")
        except json.JSONDecodeError as e:
            print(f"[Template Agent] Failed to parse JSON response: {e}")
            print(f"[Template Agent] Response was: {response_text[:200]}...")
            # Fallback to placeholder texts
            generated_texts = {role: f"[{role}]" for role in text_prompts}
        
        return {"generated_texts": generated_texts}
        
    except Exception as e:
        print(f"[Template Agent] Error generating texts: {e}")
        # Return placeholder texts
        return {
            "generated_texts": {role: f"[{role}]" for role in text_prompts},
            "error": str(e)
        }


def fill_template(state: TemplateState) -> Dict[str, Any]:
    """Fill template placeholders with brand data and generated content"""
    print("[Template Agent] Filling template with content...")
    
    template_def = state.get('template_def', {})
    brand_data = state.get('brand_data', {})
    generated_texts = state.get('generated_texts', {})
    
    if not template_def:
        return {
            "filled_templates": {},
            "status": "failed",
            "error": "No template definition"
        }
    
    # Prepare placeholder values
    placeholders = {
        'colors.primary': brand_data.get('colors', ['#00539F'])[0] if brand_data.get('colors') else '#00539F',
        'colors.secondary': brand_data.get('colors', ['#00539F', '#D6001C'])[1] if len(brand_data.get('colors', [])) > 1 else '#D6001C',
        'colors.text': '#FFFFFF',
        'logo_url': brand_data.get('logoUrl', brand_data.get('logo_url', '')),
    }
    
    # Add asset URLs
    asset_urls = brand_data.get('assetUrls', brand_data.get('assets', []))
    if isinstance(asset_urls, list):
        for i, url in enumerate(asset_urls):
            placeholders[f'asset_urls.{i}'] = url
    
    # Add generated texts
    for role, text in generated_texts.items():
        placeholders[f'generated_{role}'] = text
    
    # Fill templates for each format
    filled_templates = {}
    format_mapping = {
        'facebook': 'facebook',
        'instagram_post': 'instagram',
        'instagram_story': 'story'
    }
    
    for format_key, canvas_key in format_mapping.items():
        format_def = template_def.get('formats', {}).get(format_key, {})
        if not format_def:
            continue
            
        canvas_objects = []
        
        for element in format_def.get('elements', []):
            obj = fill_element(element, placeholders, generated_texts)
            if obj:
                canvas_objects.append(obj)
        
        # Replace background placeholder
        background = format_def.get('background', '#FFFFFF')
        background = replace_placeholder(background, placeholders)
        
        filled_templates[canvas_key] = {
            "objects": canvas_objects,
            "background": background,
            "width": format_def.get('width'),
            "height": format_def.get('height')
        }
    
    print(f"[Template Agent] Filled {len(filled_templates)} format templates")
    
    return {
        "filled_templates": filled_templates,
        "status": "completed"
    }


def fill_element(element: Dict[str, Any], placeholders: Dict[str, str], generated_texts: Dict[str, str]) -> Optional[Dict[str, Any]]:
    """Fill a single element with placeholders"""
    element_type = element.get('type')
    
    if element_type == 'rect':
        fill_color = replace_placeholder(element.get('fill', '#000000'), placeholders)
        
        obj = {
            "type": "rect",
            "left": element.get('left', 0),
            "top": element.get('top', 0),
            "width": element.get('width', 100),
            "height": element.get('height', 100),
            "fill": fill_color if fill_color != 'transparent' else 'rgba(0,0,0,0)',
        }
        
        # Handle stroke
        if element.get('stroke'):
            obj['stroke'] = replace_placeholder(element['stroke'], placeholders)
            obj['strokeWidth'] = element.get('strokeWidth', 1)
        
        return obj
        
    elif element_type == 'text':
        role = element.get('role', '')
        
        # Get content - either from generated texts or placeholder replacement
        content = element.get('content', '')
        if content.startswith('{{generated_'):
            # Extract the key from {{generated_xxx}}
            key = content[2:-2]  # Remove {{ and }}
            text_role = key.replace('generated_', '')
            content = generated_texts.get(text_role, generated_texts.get(key, f'[{role}]'))
        else:
            content = replace_placeholder(content, placeholders)
        
        fill_color = replace_placeholder(element.get('fill', '#000000'), placeholders)
        
        obj = {
            "type": "textbox",
            "left": element.get('left', 0),
            "top": element.get('top', 0),
            "text": content,
            "fontSize": element.get('fontSize', 24),
            "fontWeight": element.get('fontWeight', 'normal'),
            "fontFamily": element.get('fontFamily', 'Arial'),
            "fill": fill_color,
        }
        
        # Handle center alignment
        if element.get('originX') == 'center':
            obj['originX'] = 'center'
        if element.get('textAlign'):
            obj['textAlign'] = element['textAlign']
            
        return obj
        
    elif element_type == 'image':
        source = element.get('source', '')
        source = replace_placeholder(source, placeholders)
        
        if not source:
            return None
            
        obj = {
            "type": "image",
            "left": element.get('left', 0),
            "top": element.get('top', 0),
            "src": source,
            "scaleToWidth": element.get('scaleToWidth', 200),
        }
        
        return obj
    
    return None


def replace_placeholder(value: str, placeholders: Dict[str, str]) -> str:
    """Replace {{placeholder}} patterns with actual values"""
    if not isinstance(value, str):
        return value
        
    pattern = r'\{\{([^}]+)\}\}'
    
    def replacer(match):
        key = match.group(1)
        return placeholders.get(key, match.group(0))
    
    return re.sub(pattern, replacer, value)


# Build the LangGraph
builder = StateGraph(TemplateState)

builder.add_node("fetch_brand_data", fetch_brand_data)
builder.add_node("load_template", load_template)
builder.add_node("generate_texts", generate_texts)
builder.add_node("fill_template", fill_template)

builder.set_entry_point("fetch_brand_data")
builder.add_edge("fetch_brand_data", "load_template")
builder.add_edge("load_template", "generate_texts")
builder.add_edge("generate_texts", "fill_template")
builder.add_edge("fill_template", END)

template_graph = builder.compile()


# Helper to get template list
def get_template_list() -> List[Dict[str, Any]]:
    """Load and return the list of available templates"""
    index_path = TEMPLATES_DIR / "index.json"
    
    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('templates', [])
    except Exception as e:
        print(f"[Template Agent] Error loading template index: {e}")
        return []


if __name__ == "__main__":
    # Test the template list loading
    templates = get_template_list()
    print(f"Found {len(templates)} templates:")
    for t in templates:
        print(f"  - {t['id']}: {t['name']}")
