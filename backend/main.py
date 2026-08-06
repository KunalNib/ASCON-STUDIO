from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import json
from pymongo.database import Database
from pydantic import BaseModel
from rag import AssistantRAG
import models
import database
import auth

# No table creation needed for MongoDB
app = FastAPI(title="ASCON Studio AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_engine = AssistantRAG()

class UserCreate(BaseModel):
    email: str
    password: str

@app.post("/register")
def register(user: UserCreate, db: Database = Depends(database.get_db)):
    db_user = db.users.find_one({"email": user.email})
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pass = auth.get_password_hash(user.password)
    new_user = models.UserInDB(email=user.email, hashed_password=hashed_pass)
    db.users.insert_one(new_user.model_dump())
    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: UserCreate, db: Database = Depends(database.get_db)):
    db_user = db.users.find_one({"email": user.email})
    if not db_user or not auth.verify_password(user.password, db_user.get("hashed_password")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = auth.create_access_token(data={"sub": db_user.get("email")})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/quiz/generate")
def generate_quiz():
    return rag_engine.generate_quiz()

class QuizSubmit(BaseModel):
    earned_xp: int

@app.post("/quiz/submit")
def submit_quiz(submission: QuizSubmit, db: Database = Depends(database.get_db)):
    # In a full flow we would secure this via OAuth2 token decode
    # But for MVP we will just grant anonymous XP back to the client
    return {"message": "Success", "awarded_xp": submission.earned_xp}

@app.get("/")
def health_check():
    return {"status": "ASCON Backend is running"}

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/ai-tutor")
async def ai_tutor_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive user message
            raw_data = await websocket.receive_text()
            try:
                data = json.loads(raw_data)
                context = data.get("context", {})
                message_text = data.get("text", "")
            except json.JSONDecodeError:
                context = {}
                message_text = raw_data
            
            # For demonstration, we simulate an intelligent tutor response via streaming
            async for chunk in rag_engine.query_stream(message_text, context=context):
                await manager.send_message(json.dumps(chunk), websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
