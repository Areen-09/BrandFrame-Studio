from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CreativeRequest(BaseModel):
    brandkit_id: str
    user_id: str
    prompt: str
    aspect_ratio: str = "1:1"  # 1:1, 9:16, 16:9

class CreativeResponse(BaseModel):
    image_url: str
    status: str
    description: Optional[str] = None


# Template Generation Models
class TemplateGenerationRequest(BaseModel):
    user_id: str
    brandkit_id: str
    template_id: str


class TemplateGenerationResponse(BaseModel):
    status: str
    formats: Dict[str, Any]  # Contains canvas JSON for each format (facebook, instagram, story)
    message: str


class TemplateInfo(BaseModel):
    id: str
    name: str
    description: str
    thumbnail: str
    category: str


class TemplateListResponse(BaseModel):
    templates: List[TemplateInfo]
