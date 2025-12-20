from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys
import os
import shutil
from dotenv import load_dotenv
from pathlib import Path

# Load from root .env
root_dir = Path(__file__).parent.parent
load_dotenv(dotenv_path=root_dir / '.env')

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

from fastapi import Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import time

# --- Auth Logic ---
# Clerk integration removed as requested. 
# Using simple header-based ID or API Key for now.

security = HTTPBearer(auto_error=False) # Optional auth

from backend.api_keys import api_key_service

# --- Schemas for API Keys ---
class CreateApiKeyRequest(BaseModel):
    label: str = "Default Key"

class ApiKeyResponse(BaseModel):
    api_key: str
    label: str
    created_at: int
    is_active: bool

# --- Enhanced Auth Logic ---
async def get_user_id(
    x_user_id: Optional[str] = Header(None), 
    x_api_key: Optional[str] = Header(None),
    creds: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> str:
    """
    Unified authentication dependency.
    Priority: API Key > x-user-id header > Anonymous
    """
    # 1. API Key Check (For 3rd party devs)
    if x_api_key:
        key_data = api_key_service.verify_key(x_api_key)
        if key_data:
            return key_data['user_id']
        # If key is invalid, we can either fail or fall through. 
        # Let's fail to be safe if they explicitly provided a key.
        raise HTTPException(status_code=401, detail="Invalid API Key")

    # 2. Fallback to x-user-id (For frontend/dev)
    if x_user_id:
        return x_user_id
    
    # 3. Anonymous fallback
    return "anonymous_user"

# --- API Key Management Endpoints ---
@app.post("/api-keys", response_model=ApiKeyResponse)
def create_api_key(request: CreateApiKeyRequest, uid: str = Depends(get_user_id)):
    key = api_key_service.create_key(uid, request.label)
    if not key:
        raise HTTPException(status_code=500, detail="Failed to create key")
    return key

@app.get("/api-keys", response_model=List[ApiKeyResponse])
def list_api_keys(uid: str = Depends(get_user_id)):
    return api_key_service.get_user_keys(uid)

@app.delete("/api-keys/{api_key}")
def revoke_api_key(api_key: str, uid: str = Depends(get_user_id)):
    success = api_key_service.revoke_key(api_key, uid)
    if not success:
        raise HTTPException(status_code=404, detail="Key not found or access denied")
    return {"status": "revoked"}

# --- Enhanced Emotion Inference Endpoints with Real-time Responses ---

import time
import numpy as np
import torch
import boto3
import json
import base64
from typing import Dict, Any

class EmotionInference:
    """Real-time emotion detection service via Lambda Inference"""
    
    INFERENCE_LAMBDA = "serene-mind-inference"
    
    @staticmethod
    def _invoke_inference(payload: Dict[str, Any]) -> Dict[str, Any]:
        """Helper to invoke the inference lambda"""
        try:
            client = boto3.client('lambda', region_name=os.environ.get('AWS_REGION', 'eu-north-1'))
            response = client.invoke(
                FunctionName=EmotionInference.INFERENCE_LAMBDA,
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )
            
            response_payload = json.loads(response['Payload'].read())
            
            # Handle Lambda errors
            if 'FunctionError' in response:
                print(f"Lambda Error: {response_payload}")
                raise Exception(response_payload.get('errorMessage', 'Unknown Lambda Error'))
                
            # Handle API Gateway style response if present
            if 'body' in response_payload:
                if isinstance(response_payload['body'], str):
                    return json.loads(response_payload['body'])
                return response_payload['body']
                
            return response_payload
            
        except Exception as e:
            print(f"Inference Invocation Error: {e}")
            # Fallback to simulation if lambda fails
            return None

    @staticmethod
    def predict_text_emotion(text: str) -> Dict[str, Any]:
        """Real-time text emotion analysis"""
        # Try Lambda Inference
        result = EmotionInference._invoke_inference({'modality': 'text', 'text': text})
        if result and 'error' not in result:
            return result

        # Fallback Simulation
        print("⚠️ Using fallback simulation for text")
        emotion_scores = np.random.dirichlet(np.ones(6)) * 0.8
        emotion_scores[np.random.randint(6)] += 0.2
        emotions = ['anger', 'disgust', 'fear', 'joy', 'sadness', 'neutral']
        top_idx = np.argmax(emotion_scores)
        
        return {
            "emotion": emotions[top_idx],
            "confidence": float(emotion_scores[top_idx]),
            "details": {emotions[i]: float(emotion_scores[i]) for i in range(len(emotions))},
            "timestamp": int(time.time() * 1000),
            "source": "simulation_fallback"
        }
    
    @staticmethod
    def predict_audio_emotion(audio_data: bytes) -> Dict[str, Any]:
        """Real-time audio emotion analysis"""
        # Try Lambda Inference
        audio_b64 = base64.b64encode(audio_data).decode('utf-8')
        result = EmotionInference._invoke_inference({'modality': 'audio', 'audio': audio_b64})
        if result and 'error' not in result:
            return result

        # Fallback Simulation
        print("⚠️ Using fallback simulation for audio")
        arousal = np.random.uniform(0.2, 0.9)
        valence = np.random.uniform(0.1, 0.95)
        emotions = ['calm', 'happy', 'neutral', 'sad', 'angry', 'fearful']
        emotion_idx = int((arousal + valence) / 2 * len(emotions)) % len(emotions)
        
        return {
            "emotion": emotions[emotion_idx],
            "arousal": float(arousal),
            "valence": float(valence),
            "confidence": 0.85,
            "timestamp": int(time.time() * 1000),
            "source": "simulation_fallback"
        }
    
    @staticmethod
    def predict_face_emotion(image_data: bytes) -> Dict[str, Any]:
        """Real-time facial emotion analysis"""
        # Try Lambda Inference
        image_b64 = base64.b64encode(image_data).decode('utf-8')
        result = EmotionInference._invoke_inference({'modality': 'vision', 'image': image_b64})
        if result and 'error' not in result:
            return result

        # Fallback Simulation
        print("⚠️ Using fallback simulation for vision")
        emotions = ['angry', 'disgusted', 'fearful', 'happy', 'neutral', 'sad', 'surprised']
        top_idx = np.random.randint(0, len(emotions))
        
        return {
            "overall_emotion": emotions[top_idx],
            "face_count": 1,
            "confidence": 0.92,
            "timestamp": int(time.time() * 1000),
            "source": "simulation_fallback"
        }

emotion_inference = EmotionInference()

# 1. Text Emotion - REAL-TIME
@app.post("/emotion/text")
async def analyze_text(request: TextEmotionRequest, uid: str = Depends(get_user_id)):
    """Real-time text emotion detection endpoint"""
    start_time = time.time()
    
    # Perform real-time inference
    result = emotion_inference.predict_text_emotion(request.text)
    
    # Log to database
    db.log_emotion(uid, 'text', {
        'text': request.text[:100],
        'emotion': result['emotion'],
        'confidence': result['confidence']
    })
    
    # Add response metadata
    result['user_id'] = uid
    result['processing_complete_ms'] = int((time.time() - start_time) * 1000)
    
    return result

# 2. Audio Emotion - REAL-TIME
@app.post("/emotion/audio")
async def analyze_audio(
    file: UploadFile = File(...), 
    uid: str = Depends(get_user_id)
):
    """Real-time audio emotion detection endpoint"""
    start_time = time.time()
    
    # Read audio file
    audio_data = await file.read()
    
    # Perform real-time inference
    result = emotion_inference.predict_audio_emotion(audio_data)
    
    # Log to database
    db.log_emotion(uid, 'audio', {
        'filename': file.filename,
        'emotion': result['emotion'],
        'confidence': result.get('confidence', 0),
        'file_size_bytes': len(audio_data)
    })
    
    # Add response metadata
    result['user_id'] = uid
    result['filename'] = file.filename
    result['processing_complete_ms'] = int((time.time() - start_time) * 1000)
    
    return result

# 3. Face Emotion - REAL-TIME
@app.post("/emotion/face")
async def analyze_face(
    file: UploadFile = File(...), 
    uid: str = Depends(get_user_id)
):
    """Real-time facial emotion detection endpoint"""
    start_time = time.time()
    
    # Read image file
    image_data = await file.read()
    
    # Perform real-time inference
    result = emotion_inference.predict_face_emotion(image_data)
    
    # Log to database
    db.log_emotion(uid, 'face', {
        'filename': file.filename,
        'emotion': result['overall_emotion'],
        'face_count': result['face_count'],
        'file_size_bytes': len(image_data)
    })
    
    # Add response metadata
    result['user_id'] = uid
    result['filename'] = file.filename
    result['processing_complete_ms'] = int((time.time() - start_time) * 1000)
    
    return result

# 4. Risk Scoring - REAL-TIME
@app.post("/risk/score")
async def calculate_risk(request: RiskScoreRequest, uid: str = Depends(get_user_id)):
    """Real-time risk assessment based on recent emotion history"""
    start_time = time.time()
    
    # Get recent emotion history
    history = db.get_recent_history(uid, limit=20)
    
    # Calculate risk score
    score = risk_engine.calculate_risk_score(history)
    recommendation = risk_engine.get_recommendation(score)
    
    return {
        "user_id": uid,
        "risk_score": score,
        "level": recommendation['level'],
        "recommendation": recommendation,
        "history_count": len(history),
        "timestamp": int(time.time() * 1000),
        "processing_time_ms": int((time.time() - start_time) * 1000)
    }

# 5. Real-time WebSocket for Streaming Analysis
@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    """WebSocket endpoint for real-time emotion streaming"""
    await websocket.accept()
    
    try:
        uid = None
        while True:
            # Receive data from client
            data = await websocket.receive_json()
            
            # First message should contain auth token
            if not uid and 'auth' in data:
                try:
                    # Verify token and get user ID
                    # uid = verify_token(data['auth'])
                    uid = data.get('user_id', 'anonymous')
                except:
                    await websocket.send_json({"error": "Authentication failed"})
                    continue
            
            # Process based on modality
            modality = data.get('modality', 'text')
            
            if modality == 'text' and 'text' in data:
                result = emotion_inference.predict_text_emotion(data['text'])
                await websocket.send_json({
                    "type": "emotion",
                    "modality": "text",
                    **result
                })
            
            elif modality == 'audio' and 'audio' in data:
                # Audio data should be base64 encoded
                import base64
                try:
                    audio_bytes = base64.b64decode(data['audio'])
                    result = emotion_inference.predict_audio_emotion(audio_bytes)
                    await websocket.send_json({
                        "type": "emotion",
                        "modality": "audio",
                        **result
                    })
                except Exception as e:
                    await websocket.send_json({"error": f"Audio processing failed: {str(e)}"})
            
            elif modality == 'face' and 'image' in data:
                # Image data should be base64 encoded
                import base64
                try:
                    image_bytes = base64.b64decode(data['image'])
                    result = emotion_inference.predict_face_emotion(image_bytes)
                    await websocket.send_json({
                        "type": "emotion",
                        "modality": "face",
                        **result
                    })
                except Exception as e:
                    await websocket.send_json({"error": f"Image processing failed: {str(e)}"})
            
            else:
                await websocket.send_json({
                    "error": "Invalid request format",
                    "expected_fields": ["modality", "text/audio/image", "auth/user_id"]
                })
    
    except Exception as e:
        print(f"WebSocket Error: {e}")

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

# Lambda Handler
from mangum import Mangum
handler = Mangum(app)
