from fastapi import APIRouter, HTTPException
from app.api.v1.models import CreativeRequest, CreativeResponse
from app.agents.creative_agent import creative_graph

router = APIRouter()

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
