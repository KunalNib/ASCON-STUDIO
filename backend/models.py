from pydantic import BaseModel
from typing import Optional

class UserInDB(BaseModel):
    email: str
    hashed_password: str = ""
    name: Optional[str] = None
    picture: Optional[str] = None
    auth_provider: str = "local" # "local" or "google"
    
    # Progress tracking across the learning modules
    module_beginner_passed: bool = False
    module_intermediate_passed: bool = False
    module_advanced_passed: bool = False
    module_expert_passed: bool = False
    
    # Gamification
    xp: int = 0
    achievements: str = "" # Comma separated list of badges

class GoogleAuthSchema(BaseModel):
    token: str

