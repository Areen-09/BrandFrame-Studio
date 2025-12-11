"""
Product Agent - LangGraph workflow for AI-powered product poster generation

This agent takes product information and brandkit, then:
1. Fetches brand data from Firestore (colors, logo, style)
2. Uses Gemini 2.5 Flash to design poster layouts for all 3 formats
3. Generates any required images using Nano Banana Pro
4. Builds Fabric.js-compatible canvas objects
"""

import os
import json
import re
import base64
from typing import TypedDict, Dict, Any, List, Optional
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.service.brand_service import brand_service
from app.core.config import settings


# Canvas format dimensions
FORMATS = {
    "instagram": {"width": 1080, "height": 1080, "name": "Instagram Post"},
    "story": {"width": 1080, "height": 1920, "name": "Instagram Story"},
    "facebook": {"width": 1200, "height": 630, "name": "Facebook Post"},
}


class ProductState(TypedDict):
    user_id: str
    brandkit_id: str
    product_name: str
    product_description: Optional[str]
    poster_type: str
    poster_description: Optional[str]
    product_image_data: Optional[str]  # Base64 data URL
    tagline: Optional[str]
    brand_data: Dict[str, Any]
    poster_layouts: Dict[str, Any]  # JSON layouts from Gemini
    generated_images: Dict[str, str]  # role -> image URL/data
    canvas_formats: Dict[str, Any]  # Final Fabric.js compatible objects
    status: str
    error: Optional[str]


def fetch_brand_data(state: ProductState) -> Dict[str, Any]:
    """Fetch brandkit data from Firestore"""
    print(f"[Product Agent] Fetching brand data for {state['brandkit_id']} (User: {state['user_id']})")
    
    try:
        doc_ref = brand_service.db.collection('users').document(state['user_id']).collection('brandkits').document(state['brandkit_id'])
        doc = doc_ref.get()
        
        if doc.exists:
            brand_data = doc.to_dict()
            print(f"[Product Agent] Found brandkit: {brand_data.get('name', 'Unknown')}")
        else:
            print(f"[Product Agent] BrandKit not found. Using fallback.")
            brand_data = brand_service.get_brandkit(state['brandkit_id'])
            
        return {"brand_data": brand_data}
        
    except Exception as e:
        print(f"[Product Agent] Error fetching brand data: {e}")
        return {
            "brand_data": brand_service.get_brandkit(state['brandkit_id']),
            "error": str(e)
        }


def design_poster_layouts(state: ProductState) -> Dict[str, Any]:
    """Use Gemini 2.5 Flash to design JSON layouts for all poster formats"""
    print("[Product Agent] Designing poster layouts with Gemini 2.5 Flash...")
    
    brand_data = state.get('brand_data', {})
    
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.7,
            google_api_key=settings.GOOGLE_API_KEY
        )
        
        # Extract brand info
        brand_name = brand_data.get('name', 'Brand')
        colors = brand_data.get('colors', ['#00539F', '#D6001C'])
        primary_color = colors[0] if colors else '#00539F'
        secondary_color = colors[1] if len(colors) > 1 else '#D6001C'
        logo_url = brand_data.get('logoUrl', brand_data.get('logo_url', ''))
        brand_tone = brand_data.get('tone', 'Professional')
        brand_style = brand_data.get('style', 'Modern')
        
        # Product info
        product_name = state.get('product_name', 'Product')
        product_desc = state.get('product_description', '')
        poster_type = state.get('poster_type', 'sale')
        poster_desc = state.get('poster_description', '')
        tagline = state.get('tagline', '')
        has_product_image = bool(state.get('product_image_data'))
        
        system_prompt = f"""You are an expert retail poster designer. Create a JSON layout specification for a product poster.

BRAND INFORMATION:
- Brand Name: {brand_name}
- Primary Color: {primary_color}
- Secondary Color: {secondary_color}
- Tone: {brand_tone}
- Style: {brand_style}
- Has Logo: {bool(logo_url)}

PRODUCT INFORMATION:
- Product Name: {product_name}
- Description: {product_desc}
- Poster Type: {poster_type}
- Design Preferences: {poster_desc}
- Tagline: {tagline}
- Has Product Image: {has_product_image}

Create layouts for these 3 formats:
1. instagram: 1080x1080 (square)
2. story: 1080x1920 (vertical)
3. facebook: 1200x630 (horizontal)

Return a JSON object with this EXACT structure:
{{
    "images_to_generate": [
        {{
            "role": "background",
            "prompt": "detailed prompt for generating this image",
            "required": true
        }},
        // Add more images if needed (decorative elements, product showcase, etc.)
    ],
    "instagram": {{
        "background": "solid" | "gradient" | "image",
        "background_color": "#hex",
        "gradient_colors": ["#hex1", "#hex2"],
        "elements": [
            {{
                "type": "text",
                "role": "headline" | "product_name" | "tagline" | "cta",
                "content": "text content",
                "left": number,
                "top": number,
                "fontSize": number,
                "fontWeight": "normal" | "bold",
                "fontFamily": "Arial",
                "fill": "#hex",
                "textAlign": "left" | "center" | "right",
                "width": number
            }},
            {{
                "type": "image",
                "role": "logo" | "product" | "background" | "decorative",
                "left": number,
                "top": number,
                "scaleToWidth": number,
                "scaleToHeight": number
            }},
            {{
                "type": "rect",
                "left": number,
                "top": number,
                "width": number,
                "height": number,
                "fill": "#hex",
                "opacity": number
            }}
        ]
    }},
    "story": {{ ... same structure ... }},
    "facebook": {{ ... same structure ... }}
}}

DESIGN GUIDELINES:
- Use brand colors prominently
- Position elements for visual hierarchy
- Leave enough padding from edges (at least 40px)
- Make text readable (good contrast)
- For {poster_type} posters, emphasize urgency and value
- If no product image, suggest generating a relevant product showcase image
- Include decorative elements that match the brand style

Return ONLY valid JSON, no markdown, no explanation."""

        response = llm.invoke([HumanMessage(content=system_prompt)])
        response_text = response.content.strip()
        
        # Clean up markdown if present
        if response_text.startswith('```'):
            response_text = re.sub(r'^```json?\s*', '', response_text)
            response_text = re.sub(r'\s*```$', '', response_text)
        
        try:
            poster_layouts = json.loads(response_text)
            print(f"[Product Agent] Generated layouts for {len([k for k in poster_layouts.keys() if k in FORMATS])} formats")
            
            # Ensure images_to_generate exists
            if 'images_to_generate' not in poster_layouts:
                poster_layouts['images_to_generate'] = []
                
            return {"poster_layouts": poster_layouts}
            
        except json.JSONDecodeError as e:
            print(f"[Product Agent] Failed to parse layout JSON: {e}")
            print(f"[Product Agent] Response was: {response_text[:300]}...")
            return {
                "poster_layouts": {},
                "status": "failed",
                "error": f"Failed to parse AI response: {e}"
            }
            
    except Exception as e:
        print(f"[Product Agent] Error designing layouts: {e}")
        return {
            "poster_layouts": {},
            "status": "failed",
            "error": str(e)
        }


def generate_required_images(state: ProductState) -> Dict[str, Any]:
    """Generate any required images using Nano Banana Pro"""
    print("[Product Agent] Checking for images to generate...")
    
    poster_layouts = state.get('poster_layouts', {})
    images_to_generate = poster_layouts.get('images_to_generate', [])
    brand_data = state.get('brand_data', {})
    
    if not images_to_generate:
        print("[Product Agent] No images to generate")
        return {"generated_images": {}}
    
    generated_images = {}
    
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-3-pro-image-preview",
            temperature=1.0,
            google_api_key=settings.GOOGLE_API_KEY
        )
        
        brand_name = brand_data.get('name', 'Brand')
        colors = brand_data.get('colors', ['#00539F'])
        
        for img_spec in images_to_generate:
            role = img_spec.get('role', 'unknown')
            prompt = img_spec.get('prompt', '')
            
            if not prompt:
                continue
                
            print(f"[Product Agent] Generating image for role: {role}")
            
            # Enhance prompt with brand context
            enhanced_prompt = f"""Create a professional retail marketing image for {brand_name}.
Brand colors: {', '.join(colors)}

{prompt}

The image should be high-quality, suitable for retail marketing materials.
No text in the image. Clean, modern aesthetic."""

            try:
                response = llm.invoke([HumanMessage(content=enhanced_prompt)])
                generated_content = response.content
                
                # Handle multimodal response
                if isinstance(generated_content, list):
                    text_parts = [
                        part if isinstance(part, str) else str(part) 
                        for part in generated_content
                    ]
                    generated_content = "".join(text_parts).strip()
                    
                generated_content = str(generated_content).strip()
                
                # Try to extract image URL or data URI
                image_url = ""
                
                # Try parsing as dict
                try:
                    if generated_content.startswith("{") and "image_url" in generated_content:
                        import ast
                        parsed = ast.literal_eval(generated_content)
                        if isinstance(parsed, dict):
                            img_val = parsed.get("image_url")
                            if isinstance(img_val, dict):
                                image_url = img_val.get("url", "")
                            elif isinstance(img_val, str):
                                image_url = img_val
                except:
                    pass
                
                # Regex fallback
                if not image_url:
                    url_match = re.search(r'(https?://[^\s"\']+)', generated_content)
                    if url_match:
                        image_url = url_match.group(1)
                    else:
                        data_match = re.search(r'(data:image/[^;]+;base64,[^\"\'\s]+)', generated_content)
                        if data_match:
                            image_url = data_match.group(1)
                
                if image_url:
                    generated_images[role] = image_url
                    print(f"[Product Agent] Successfully generated image for {role}")
                else:
                    print(f"[Product Agent] Could not extract image URL for {role}")
                    
            except Exception as e:
                print(f"[Product Agent] Error generating image for {role}: {e}")
                continue
                
    except Exception as e:
        print(f"[Product Agent] Error in image generation: {e}")
        
    return {"generated_images": generated_images}


def build_canvas_objects(state: ProductState) -> Dict[str, Any]:
    """Build Fabric.js-compatible canvas objects for each format"""
    print("[Product Agent] Building canvas objects...")
    
    poster_layouts = state.get('poster_layouts', {})
    generated_images = state.get('generated_images', {})
    brand_data = state.get('brand_data', {})
    product_image_data = state.get('product_image_data')
    
    logo_url = brand_data.get('logoUrl', brand_data.get('logo_url', ''))
    
    canvas_formats = {}
    
    for format_key, format_info in FORMATS.items():
        layout = poster_layouts.get(format_key, {})
        if not layout:
            continue
            
        objects = []
        width = format_info['width']
        height = format_info['height']
        
        # Determine background
        bg_type = layout.get('background', 'solid')
        background = '#ffffff'
        
        if bg_type == 'solid':
            background = layout.get('background_color', '#ffffff')
        elif bg_type == 'gradient':
            # Fabric.js doesn't support gradients as background directly
            # We'll create a rect covering the canvas
            gradient_colors = layout.get('gradient_colors', ['#ffffff', '#f0f0f0'])
            # For simplicity, use the first gradient color as solid background
            # A gradient rect would need to be added as first element
            background = gradient_colors[0] if gradient_colors else '#ffffff'
            
            # Add gradient rect as first element
            objects.append({
                "type": "rect",
                "left": 0,
                "top": 0,
                "width": width,
                "height": height,
                "fill": gradient_colors[0] if gradient_colors else '#ffffff',
                "selectable": False,
                "evented": False
            })
        elif bg_type == 'image':
            # Use generated background image if available
            if 'background' in generated_images:
                objects.append({
                    "type": "image",
                    "left": 0,
                    "top": 0,
                    "src": generated_images['background'],
                    "scaleToWidth": width,
                    "scaleToHeight": height,
                    "selectable": False,
                    "evented": False
                })
        
        # Process elements
        for element in layout.get('elements', []):
            elem_type = element.get('type')
            role = element.get('role', '')
            
            if elem_type == 'text':
                obj = {
                    "type": "textbox",
                    "left": element.get('left', 50),
                    "top": element.get('top', 50),
                    "text": element.get('content', ''),
                    "fontSize": element.get('fontSize', 32),
                    "fontWeight": element.get('fontWeight', 'normal'),
                    "fontFamily": element.get('fontFamily', 'Arial'),
                    "fill": element.get('fill', '#000000'),
                    "textAlign": element.get('textAlign', 'left'),
                }
                if element.get('width'):
                    obj['width'] = element['width']
                objects.append(obj)
                
            elif elem_type == 'image':
                src = None
                
                if role == 'logo' and logo_url:
                    src = logo_url
                elif role == 'product' and product_image_data:
                    src = product_image_data
                elif role in generated_images:
                    src = generated_images[role]
                elif role == 'background' and 'background' in generated_images:
                    src = generated_images['background']
                    
                if src:
                    obj = {
                        "type": "image",
                        "left": element.get('left', 0),
                        "top": element.get('top', 0),
                        "src": src,
                    }
                    if element.get('scaleToWidth'):
                        obj['scaleToWidth'] = element['scaleToWidth']
                    if element.get('scaleToHeight'):
                        obj['scaleToHeight'] = element['scaleToHeight']
                    objects.append(obj)
                    
            elif elem_type == 'rect':
                obj = {
                    "type": "rect",
                    "left": element.get('left', 0),
                    "top": element.get('top', 0),
                    "width": element.get('width', 100),
                    "height": element.get('height', 100),
                    "fill": element.get('fill', '#000000'),
                }
                if element.get('opacity') is not None:
                    obj['opacity'] = element['opacity']
                if element.get('rx'):
                    obj['rx'] = element['rx']
                    obj['ry'] = element.get('ry', element['rx'])
                objects.append(obj)
        
        canvas_formats[format_key] = {
            "objects": objects,
            "background": background,
            "width": width,
            "height": height
        }
        
    print(f"[Product Agent] Built canvas objects for {len(canvas_formats)} formats")
    
    return {
        "canvas_formats": canvas_formats,
        "status": "completed"
    }


# Build the LangGraph
builder = StateGraph(ProductState)

builder.add_node("fetch_brand_data", fetch_brand_data)
builder.add_node("design_poster_layouts", design_poster_layouts)
builder.add_node("generate_required_images", generate_required_images)
builder.add_node("build_canvas_objects", build_canvas_objects)

builder.set_entry_point("fetch_brand_data")
builder.add_edge("fetch_brand_data", "design_poster_layouts")
builder.add_edge("design_poster_layouts", "generate_required_images")
builder.add_edge("generate_required_images", "build_canvas_objects")
builder.add_edge("build_canvas_objects", END)

product_graph = builder.compile()


# Visualization Helper
def save_graph_image():
    try:
        graph_png = product_graph.get_graph().draw_mermaid_png()
        with open("product_workflow_graph.png", "wb") as f:
            f.write(graph_png)
        print("Graph saved to product_workflow_graph.png")
    except Exception as e:
        print(f"Graph visualization failed: {e}")


if __name__ == "__main__":
    save_graph_image()
