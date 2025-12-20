from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
import shutil
from dotenv import load_dotenv

load_dotenv()

# Fix path to allow importing from sibling directories
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_models.text_model import create_text_model
from ml_models.audio_model import create_audio_model
from ml_models.vision_model import EmotionDetectorPipeline
from backend.risk_engine import RiskEngine
from backend.database import db

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic if needed
    get_models() 
    yield
    # Shutdown logic if needed
    print("Shutting down gracefully...")

app = FastAPI(
    title="SereneMind Advanced API (Anonymous)", 
    description="Multimodal Emotion Detection & Risk Assessment",
    version="2.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global Model Registry (Lazy Loading) ---
models = {}

def get_models():
    """Lazy load models to avoid startup timeout on Lambda"""
    if not models:
        # print("Loading SOTA Models...")
        # In actual AWS Lambda, models loads from /opt/ml or S3
        # models['text'] = create_text_model()
        pass
    return models

risk_engine = RiskEngine()

# --- Schemas ---
class TextEmotionRequest(BaseModel):
    text: str
    user_id: Optional[str] = None # Optional in body, can be in header

class RiskScoreRequest(BaseModel):
    user_id: str

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "active", "access": "anonymous"}

def get_user_id(x_user_id: Optional[str] = Header(None), body_user_id: Optional[str] = None):
    # Prioritize header for infrastructure routing (e.g. throttling), fallback to body
    uid = x_user_id or body_user_id
    if not uid:
        raise HTTPException(status_code=400, detail="Anonymous User ID required (x-user-id header)")
    return uid

# 1. Text Emotion
@app.post("/emotion/text")
async def analyze_text(request: TextEmotionRequest, x_user_id: Optional[str] = Header(None)):
    uid = get_user_id(x_user_id, request.user_id)
    
    # Save to DB (Anonymous)
    db.log_emotion(uid, 'text', {'text': request.text[:50], 'emotion': 'neutral'})
    
    return {
        "emotion": "neutral",
        "confidence": 0.92,
        "details": {"sadness": 0.01, "joy": 0.05, "neutral": 0.92}
    }

# 2. Audio Emotion
@app.post("/emotion/audio")
async def analyze_audio(file: UploadFile = File(...), x_user_id: Optional[str] = Header(None)):
    if not(x_user_id):
         # Creating dummy ID if direct file upload testing
         x_user_id = "test_anon_id"
         
    # Mock result
    db.log_emotion(x_user_id, 'audio', {'filename': file.filename, 'emotion': 'calm'})
    
    return {
        "emotion": "calm",
        "arousal": 0.3,
        "valence": 0.6 
    }

# 3. Face Emotion
@app.post("/emotion/face")
async def analyze_face(file: UploadFile = File(...), x_user_id: Optional[str] = Header(None)):
     if not(x_user_id):
         x_user_id = "test_anon_id"

     # Mock result
     db.log_emotion(x_user_id, 'face', {'filename': file.filename, 'emotion': 'happy'})
    
     return {
        "emotion": "happy",
        "box": [10, 10, 100, 100],
        "confidence": 0.98
     }

# 4. Risk Scoring
@app.post("/risk/score")
async def calculate_risk(request: RiskScoreRequest):
    history = db.get_recent_history(request.user_id)
    score = risk_engine.calculate_risk_score(history)
    recommendation = risk_engine.get_recommendation(score)
    
    return {
        "user_id": request.user_id,
        "risk_score": score,
        "level": recommendation['level'],
        "recommendation": recommendation
    }

# 5. Resources
@app.get("/resources")
def get_resources():
    return {
        "breathing": "https://example.com/breathing-guide",
        "crisis_line": "988 (USA) / 112 (EU)",
        "disclaimer": "Not a medical service.",
        "articles": [
            {"title": "Understanding Anxiety", "url": "/articles/anxiety"},
            {"title": "Sleep Hygiene", "url": "/articles/sleep"}
        ]
    }

# 6. Real-time WebSocket
@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # In real implementation, read initial message for user ID
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"status": "processing", "realtime_emotion": "neutral"})
    except Exception as e:
        print(f"WebSocket Error: {e}")
