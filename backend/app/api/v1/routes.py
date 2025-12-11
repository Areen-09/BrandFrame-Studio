from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.api.v1.models import (
    CreativeRequest, CreativeResponse,
    TemplateGenerationRequest, TemplateGenerationResponse,
    TemplateListResponse, TemplateInfo,
    ProductPosterRequest, ProductPosterResponse,
    RemoveBackgroundRequest, RemoveBackgroundResponse
)
from app.agents.creative_agent import creative_graph
from app.agents.template_agent import template_graph, get_template_list
from app.agents.product_agent import product_graph
import httpx
from urllib.parse import unquote
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/proxy_image")
async def proxy_image(url: str):
    """
    Proxy endpoint to fetch images from Firebase Storage and return them
    with proper CORS headers for frontend canvas usage.
    """
    try:
        # Don't decode - FastAPI already decodes %252F to %2F, which is what Firebase needs
        # The path must contain %2F (encoded slashes) for Firebase Storage to work
        logger.info(f"Fetching image from: {url}")
        
        async with httpx.AsyncClient(follow_redirects=True) as client:
            response = await client.get(url, timeout=30.0)
            
            logger.info(f"Response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Failed to fetch image: Status {response.status_code}")
                raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch image: {response.status_code}")
            
            # Determine content type
            content_type = response.headers.get("content-type", "image/png")
            logger.info(f"Content-Type: {content_type}")
            
            return Response(
                content=response.content,
                media_type=content_type,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "public, max-age=3600"
                }
            )
    except httpx.TimeoutException:
        logger.error("Image fetch timed out")
        raise HTTPException(status_code=408, detail="Image fetch timed out")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Proxy error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")

@router.post("/generate_creative", response_model=CreativeResponse)
async def generate_creative(request: CreativeRequest):
    try:
        # Initialize state
        initial_state = {
            "brandkit_id": request.brandkit_id,
            "user_id": request.user_id,
            "prompt": request.prompt,
            "aspect_ratio": request.aspect_ratio,
            "brand_data": {},
            "refined_prompt": "",
            "image_url": "",
            "status": "processing"
        }
        
        # Run graph
        result = await creative_graph.ainvoke(initial_state)
        
        return CreativeResponse(
            image_url=result.get("image_url", ""),
            status=result.get("status", "failed"),
            description="Creative generated successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates", response_model=TemplateListResponse)
async def list_templates():
    """
    Get list of available templates with metadata.
    """
    try:
        templates = get_template_list()
        return TemplateListResponse(
            templates=[
                TemplateInfo(
                    id=t['id'],
                    name=t['name'],
                    description=t['description'],
                    thumbnail=t['thumbnail'],
                    category=t['category']
                )
                for t in templates
            ]
        )
    except Exception as e:
        logger.error(f"Error fetching templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate_from_template", response_model=TemplateGenerationResponse)
async def generate_from_template(request: TemplateGenerationRequest):
    """
    Generate a poster from a template using the brandkit's assets and AI-generated content.
    Returns canvas-ready JSON for all 3 formats.
    """
    try:
        logger.info(f"Generating from template: {request.template_id} for user: {request.user_id}")
        
        # Initialize state
        initial_state = {
            "user_id": request.user_id,
            "brandkit_id": request.brandkit_id,
            "template_id": request.template_id,
            "brand_data": {},
            "template_def": {},
            "generated_texts": {},
            "filled_templates": {},
            "status": "processing",
            "error": None
        }
        
        # Run the template graph
        result = await template_graph.ainvoke(initial_state)
        
        if result.get("status") == "failed":
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Template generation failed")
            )
        
        return TemplateGenerationResponse(
            status=result.get("status", "completed"),
            formats=result.get("filled_templates", {}),
            message="Template generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Template generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate_product_poster", response_model=ProductPosterResponse)
async def generate_product_poster(request: ProductPosterRequest):
    """
    Generate a product poster using AI-designed layouts.
    Returns canvas-ready JSON for all 3 formats (instagram, story, facebook).
    """
    try:
        logger.info(f"Generating product poster for: {request.product_name} (User: {request.user_id})")
        
        # Initialize state
        initial_state = {
            "user_id": request.user_id,
            "brandkit_id": request.brandkit_id,
            "product_name": request.product_name,
            "product_description": request.product_description,
            "poster_type": request.poster_type,
            "poster_description": request.poster_description,
            "product_image_data": request.product_image_data,
            "tagline": request.tagline,
            "brand_data": {},
            "poster_layouts": {},
            "generated_images": {},
            "canvas_formats": {},
            "status": "processing",
            "error": None
        }
        
        # Run the product graph
        result = await product_graph.ainvoke(initial_state)
        
        if result.get("status") == "failed":
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Product poster generation failed")
            )
        
        return ProductPosterResponse(
            status=result.get("status", "completed"),
            formats=result.get("canvas_formats", {}),
            message="Product poster generated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Product poster generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/remove_background", response_model=RemoveBackgroundResponse)
async def remove_background(request: RemoveBackgroundRequest):
    """
    Remove the background from an image using rembg.
    Accepts a base64 encoded image and returns the image with transparent background.
    """
    try:
        import base64
        import io
        from PIL import Image
        from rembg import remove
        
        logger.info("Processing remove background request...")
        
        # Extract base64 data from data URL
        image_data = request.image_data
        if ',' in image_data:
            # Remove the data URL prefix (e.g., "data:image/png;base64,")
            image_data = image_data.split(',')[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(image_data)
        
        # Open image with PIL
        input_image = Image.open(io.BytesIO(image_bytes))
        
        # Remove background using rembg
        output_image = remove(input_image)
        
        # Convert result to base64
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format='PNG')
        output_buffer.seek(0)
        
        result_base64 = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
        result_data_url = f"data:image/png;base64,{result_base64}"
        
        logger.info("Background removed successfully")
        
        return RemoveBackgroundResponse(
            status="completed",
            image_data=result_data_url,
            message="Background removed successfully"
        )
        
    except ImportError as e:
        logger.error(f"Missing dependency for background removal: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Background removal service not available. Please install rembg: pip install rembg"
        )
    except Exception as e:
        logger.error(f"Background removal error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to remove background: {str(e)}")
