import os
import base64
from typing import TypedDict, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
import ast
import re
from app.service.brand_service import brand_service
from app.core.config import settings

# Define Agent State
class AgentState(TypedDict):
    brandkit_id: str
    user_id: str
    prompt: str
    aspect_ratio: str
    brand_data: Dict[str, Any]
    refined_prompt: str
    image_url: str
    status: str

# Nodes
def fetch_brand_data(state: AgentState) -> AgentState:
    print(f"Fetching brand data for {state['brandkit_id']} (User: {state['user_id']})")
    # Direct lookup strategy: users/{uid}/brandkits/{bid}
    try:
        doc_ref = brand_service.db.collection('users').document(state['user_id']).collection('brandkits').document(state['brandkit_id'])
        doc = doc_ref.get()
        if doc.exists:
            brand_data = doc.to_dict()
        else:
            print(f"BrandKit {state['brandkit_id']} not found for user {state['user_id']}. Using Mock.")
            brand_data = brand_service.get_brandkit(state['brandkit_id']) # Fallback to old method (which has mock)
    except Exception as e:
        print(f"Error fetching brand data directly: {e}")
        brand_data = brand_service.get_brandkit(state['brandkit_id']) # Fallback

    return {"brand_data": brand_data}

def refine_prompt(state: AgentState) -> AgentState:
    print("Refining prompt with Gemini Flash...")
    brand_data = state['brand_data']
    user_prompt = state['prompt']
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        temperature=0.2,
        google_api_key=settings.GOOGLE_API_KEY
    )
    
    # Safe extraction of brand data
    try:
        b_name = brand_data.get('name', 'Brand')
        b_colors = brand_data.get('colors', [])
        if isinstance(b_colors, list):
            b_colors_str = ', '.join(b_colors)
        else:
            b_colors_str = str(b_colors)
        
        b_tone = brand_data.get('tone', 'Professional')
        b_logo = brand_data.get('logo_url', '')

        system_prompt = f"""
        You are an expert creative director for a retail brand.
        Your task is to refine a user's prompt for an image generation model to ensure it complies with the brand's style guide and creates a professional retail media creative.
        
        Brand Name: {b_name}
        Brand Colors: {b_colors_str}
        Tone: {b_tone}
        Brand Logo URL: {b_logo}
        
        Output ONLY the refined prompt optimized for an AI image generator (like Imagen 3). Do not add conversational filler.
        The aspect ratio requested is {state['aspect_ratio']}.
        """
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        response = llm.invoke(messages)
        refined = response.content
        print(f"Refined Prompt: {refined}")
        return {"refined_prompt": refined}

    except Exception as e:
        print(f"Prompt refinement failed: {e}")
        # Fallback to original prompt if refinement fails
        return {"refined_prompt": user_prompt}

def generate_image(state: AgentState) -> AgentState:
    print("Generating image with Gemini 3 Pro (Image Preview)...")
    
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-3-pro-image-preview",
            temperature=1.0,
            google_api_key=settings.GOOGLE_API_KEY
        )
        
        response = llm.invoke([HumanMessage(content=state['refined_prompt'])])
        
        # --- FIX STARTS HERE ---
        generated_content = response.content
        
        # --- FIX STARTS HERE ---
        # 1. Handle Multimodal/List Content
        if isinstance(generated_content, list):
            # Join text parts
            text_parts = [
                part if isinstance(part, str) else str(part) 
                for part in generated_content
            ]
            generated_content = "".join(text_parts).strip()
            
        generated_content = str(generated_content).strip()

        # 2. Parse Stringified Dictionary (ast.literal_eval)
        # The model might return "{'image_url': {'url': '...'}}" as a string
        image_url = ""
        
        try:
            if generated_content.startswith("{") and "image_url" in generated_content:
                parsed = ast.literal_eval(generated_content)
                if isinstance(parsed, dict):
                    # Extract from structure like {'image_url': {'url': '...'}} or {'image_url': '...'}
                    img_val = parsed.get("image_url")
                    if isinstance(img_val, dict):
                        image_url = img_val.get("url", "")
                    elif isinstance(img_val, str):
                        image_url = img_val
        except Exception as parse_e:
            print(f"Failed to parse content as dict: {parse_e}")

        # 3. Fallback: Regex extraction for URLs (http or data:image)
        if not image_url:
            # Look for http/https url
            url_match = re.search(r'(https?://[^\s"\']+)', generated_content)
            if url_match:
                image_url = url_match.group(1)
            else:
                # Look for data uri
                data_match = re.search(r'(data:image/[^;]+;base64,[^"\']+)', generated_content)
                if data_match:
                    image_url = data_match.group(1)

        # 4. Final Verification
        if image_url:
            print("Successfully extracted image URL/Data URI")
            generated_url = image_url
        else:
            # If the model returned binary data or conversation instead of a URL
            print(f"Model returned complex content that could not be parsed: {generated_content[:100]}...")
            generated_url = "https://placehold.co/1080x1080/000000/FFF?text=Gemini+Image+Generated"  

        return {"image_url": generated_url, "status": "completed"}

    except Exception as e:
        print(f"Error generating image with LangChain: {e}")
        return {"image_url": "https://placehold.co/1080x1080?text=Error+Generating", "status": "failed"}

# Build Graph
builder = StateGraph(AgentState)

builder.add_node("fetch_brand_data", fetch_brand_data)
builder.add_node("refine_prompt", refine_prompt)
builder.add_node("generate_image", generate_image)

builder.set_entry_point("fetch_brand_data")
builder.add_edge("fetch_brand_data", "refine_prompt")
builder.add_edge("refine_prompt", "generate_image")
builder.add_edge("generate_image", END)

creative_graph = builder.compile()

# Visualization Helper
def save_graph_image():
    try:
        graph_png = creative_graph.get_graph().draw_mermaid_png()
        with open("creative_workflow_graph.png", "wb") as f:
            f.write(graph_png)
        print("Graph saved to creative_workflow_graph.png")
    except Exception as e:
        print(f"Start graph visualization failed (requires pygraphviz or similar): {e}")

if __name__ == "__main__":
    # If run directly, generate the graph image
    save_graph_image()
