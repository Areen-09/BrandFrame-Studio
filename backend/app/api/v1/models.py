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


# Product Poster Generation Models
class ProductPosterRequest(BaseModel):
    user_id: str
    brandkit_id: str
    product_name: str
    product_description: Optional[str] = None
    poster_type: str  # sale, promotion, event, new_arrival, seasonal, clearance, bundle, loyalty
    poster_description: Optional[str] = None
    product_image_data: Optional[str] = None  # Base64 data URL of uploaded product image
    tagline: Optional[str] = None


class ProductPosterResponse(BaseModel):
    status: str
    formats: Dict[str, Any]  # Contains canvas JSON for each format (facebook, instagram, story)
    message: str


# Remove Background Models
class RemoveBackgroundRequest(BaseModel):
    image_data: str  # Base64 encoded image data URL


class RemoveBackgroundResponse(BaseModel):
    status: str
    image_data: str  # Base64 encoded image with transparent background
    message: Optional[str] = None
