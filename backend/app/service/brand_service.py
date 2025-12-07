from typing import Dict
import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

# Initialize Firebase Admin
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred)

class BrandService:
    def __init__(self):
        self.db = firestore.client()

    def get_brandkit(self, brandkit_id: str) -> Dict:
        try:
            # Query using filter keyword argument to avoid warning/error in newer SDKs
            from google.cloud.firestore import FieldFilter
            
            docs = self.db.collection_group('brandkits').where(filter=FieldFilter('id', '==', brandkit_id)).limit(1).stream()
            
            found_doc = None
            for doc in docs:
                found_doc = doc.to_dict()
                break
                
            if found_doc:
                return found_doc
                
            print(f"BrandKit {brandkit_id} not found in Firestore. Using Mock.")
        except Exception as e:
            print(f"Error fetching BrandKit from Firestore: {e}")
            # Process continues to fallback below
        
        return {
            "id": brandkit_id,
            "name": "Tesco Finest (Mock - Fallback)",
            "colors": ["#00539F", "#D6001C", "#FFFFFF"],
            "logo_url": "https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Tesco_Logo.svg/1200px-Tesco_Logo.svg.png",
            "fonts": ["Tesco Modern", "Arial"],
            "tone": "Professional, Fresh, Quality",
            "assets": []
        }

brand_service = BrandService()
