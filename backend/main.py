import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import serial
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
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"https?://.*",
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

@app.get("/auth/config")
def get_auth_config():
    """Returns public auth configuration such as Google Client ID OAUTH_KEY."""
    oauth_key = os.getenv("OAUTH_KEY", "")
    return {"oauth_key": oauth_key}

@app.post("/auth/google")
async def google_auth(payload: models.GoogleAuthSchema, db: Database = Depends(database.get_db)):
    google_user = await auth.verify_google_token(payload.token)
    if not google_user or not google_user.get("email"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google OAuth token or authentication failed"
        )
    
    email = google_user.get("email")
    name = google_user.get("name")
    picture = google_user.get("picture")
    
    db_user = db.users.find_one({"email": email})
    if not db_user:
        new_user = models.UserInDB(
            email=email,
            name=name,
            picture=picture,
            auth_provider="google"
        )
        db.users.insert_one(new_user.model_dump())
    else:
        # Update profile metadata if changed
        db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}}
        )
    
    access_token = auth.create_access_token(data={"sub": email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": email,
            "name": name,
            "picture": picture
        }
    }


@app.get("/quiz/generate")
async def generate_quiz():
    questions = await rag_engine.agenerate_quiz_set(count=10)
    return {"questions": questions}


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
        
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()
hardware_manager = ConnectionManager()

class HardwareData(BaseModel):
    power: float
    log: str

@app.post("/hardware/data")
async def post_hardware_data(data: HardwareData):
    await hardware_manager.broadcast(json.dumps({"power": data.power, "log": data.log}))
    return {"status": "success"}

@app.websocket("/ws/hardware")
async def hardware_websocket_endpoint(websocket: WebSocket):
    await hardware_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        hardware_manager.disconnect(websocket)

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
                image_data = data.get("image")
            except json.JSONDecodeError:
                context = {}
                message_text = raw_data
                image_data = None
            
            # For demonstration, we simulate an intelligent tutor response via streaming
            async for chunk in rag_engine.query_stream(message_text, context=context, image=image_data):
                await manager.send_message(json.dumps(chunk), websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

def _read_serial_line(ser):
    if ser.in_waiting > 0:
        return ser.readline()
    return None

async def serial_reader_task():
    try:
        ser = serial.Serial("/dev/cu.usbserial-0001", 115200, timeout=0.1)
        print("Connected to USB Serial /dev/cu.usbserial-0001")
        while True:
            line = await asyncio.to_thread(_read_serial_line, ser)
            if line:
                try:
                    text = line.decode('utf-8').strip()
                    if text.startswith('{'):
                         await hardware_manager.broadcast(text)
                    else:
                         await hardware_manager.broadcast(json.dumps({"log": text}))
                except Exception:
                    pass
            else:
                await asyncio.sleep(0.01)
    except Exception as e:
        print(f"Could not connect to /dev/ttyUSB0: {e}")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(serial_reader_task())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

