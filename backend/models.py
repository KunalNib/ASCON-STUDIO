from pydantic import BaseModel

class UserInDB(BaseModel):
    email: str
    hashed_password: str
    
    # Progress tracking across the learning modules
    module_beginner_passed: bool = False
    module_intermediate_passed: bool = False
    module_advanced_passed: bool = False
    module_expert_passed: bool = False
    
    # Gamification
    xp: int = 0
    achievements: str = "" # Comma separated list of badges
