from pydantic import BaseModel
from typing import Optional, List

class CreativeRequest(BaseModel):
    brandkit_id: str
    user_id: str
    prompt: str
    aspect_ratio: str = "1:1"  # 1:1, 9:16, 16:9

class CreativeResponse(BaseModel):
    image_url: str
    status: str
    description: Optional[str] = None
