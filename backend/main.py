from fastapi import FastAPI, HTTPException, UploadFile, File, WebSocket, Header, Request
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
from decimal import Decimal
from ml_models.vision_model import EmotionDetectorPipeline
from backend.risk_engine import RiskEngine
from backend.database import db

import torch
# import librosa  <-- Moved to inside function to avoid startup crash on Py3.13
from transformers import DistilBertTokenizer
from PIL import Image
import io

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
    allow_headers=["*", "x-user-id"],
)

# --- Global Model Registry (Lazy Loading) ---
# --- Global Model Registry (Lazy Loading) ---
models = {}
tokenizer = None

def get_models():
    """Lazy load models to avoid startup timeout on Lambda"""
    global tokenizer
    if not models:
        print("Loading SOTA Models...")
        models_dir = root_dir / 'backend' / 'models'
        
        try:
            # 1. Text Model - Using SOTA Pre-trained Pipeline
            print("Loading Text Model (HuggingFace SOTA)...")
            from transformers import pipeline
            models['text_pipeline'] = pipeline(
                "text-classification", 
                model="bhadresh-savani/distilbert-base-uncased-emotion", 
                top_k=None # Return all scores
            )
            print("✅ Text Model Loaded")

            print("Loading Audio Model...")
            try:
                models['audio_pipeline'] = pipeline(
                    "audio-classification", 
                    model="superb/wav2vec2-base-superb-er",
                    top_k=None
                )
                print("✅ Audio Model Loaded")
            except Exception as e:
                print(f"⚠️ Audio Model Load Skipped: {e}")

            # 3. Vision Model - Using SOTA Image Classification
            print("Loading Vision Model (HuggingFace SOTA)...")
            try:
                models['vision_pipeline'] = pipeline(
                    "image-classification", 
                    model="dima806/facial_emotions_image_detection",
                    top_k=None
                )
                print("✅ Vision Model Loaded")
            except Exception as e:
                print(f"⚠️ Vision Model Load Skipped: {e}")
            
            print("All models loaded successfully!")
        except Exception as e:
             print(f"⚠️ Error loading local models: {e}")
             # Don't crash, allowing fallback to simulation if needed
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
    if x_api_key:
        key_data = api_key_service.verify_key(x_api_key)
        if key_data:
            return key_data['user_id']
        raise HTTPException(status_code=401, detail="Invalid API Key")

    if x_user_id:
        return x_user_id
    
    return "anonymous_user"

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

import time
import numpy as np
import torch
import boto3
import json
import base64
from typing import Dict, Any

class EmotionInference:
    """Real-time emotion detection service via Local Models or Lambda"""
    
    INFERENCE_LAMBDA = "serene-mind-inference"
    
    def __init__(self):
        self.models = get_models()
    
    @staticmethod
    def _invoke_inference(payload: Dict[str, Any]) -> Dict[str, Any]:
        """Helper to invoke the inference lambda"""
        try:
            if os.environ.get('AWS_LAMBDA_FUNCTION_NAME'):
                 pass

            client = boto3.client('lambda', region_name=os.environ.get('AWS_REGION', 'eu-north-1'))
            response = client.invoke(
                FunctionName=EmotionInference.INFERENCE_LAMBDA,
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )
            
            response_payload = json.loads(response['Payload'].read())
            
            if 'FunctionError' in response:
                print(f"Lambda Error: {response_payload}")
                raise Exception(response_payload.get('errorMessage', 'Unknown Lambda Error'))
                
            if 'body' in response_payload:
                if isinstance(response_payload['body'], str):
                    return json.loads(response_payload['body'])
                return response_payload['body']
                
            return response_payload
            
        except Exception as e:
            return None

    def _predict_local_text(self, text: str):
        if 'text_pipeline' not in self.models: return None
        try:
            results = self.models['text_pipeline'](text)
            scores = results[0] # Get first sample
            top_emotion = max(scores, key=lambda x: x['score'])
            details = {item['label']: float(item['score']) for item in scores}
            return {
                "emotion": top_emotion['label'],
                "confidence": float(top_emotion['score']),
                "details": details,
                "timestamp": int(time.time() * 1000),
                "source": "sota_transformer_model"
            }
        except Exception as e:
            print(f"Local text inference error: {e}")
            return None

    def _predict_local_audio(self, audio_data: bytes):
        if 'audio_pipeline' not in self.models: return None
        try:
            import soundfile as sf
            import numpy as np
            import scipy.signal
            
            # Load audio using soundfile
            # soundfile returns (data, samplerate)
            # data can be (samples, channels)
            y, sr = sf.read(io.BytesIO(audio_data))
            
            # Convert to mono if stereo
            if len(y.shape) > 1:
                y = np.mean(y, axis=1)
            
            # Resample to 16000 if needed
            target_sr = 16000
            if sr != target_sr:
                number_of_samples = round(len(y) * float(target_sr) / sr)
                y = scipy.signal.resample(y, number_of_samples)
                sr = target_sr
            
            # Pipeline expects numpy array. Note: check if sampling rate needs to be passed explicitly?
            # Typically pipeline(y) works if it assumes 16k, or pipeline({"array": y, "sampling_rate": 16000})
            
            results = self.models['audio_pipeline']({"array": y, "sampling_rate": 16000})
            # format: [{'score': 0.9, 'label': 'neu'}, ...]
            
            scores = results if isinstance(results, list) else [results]
            
            # Find max score
            top_emotion = max(scores, key=lambda x: x['score'])
            
            details = {item['label']: float(item['score']) for item in scores}
            
            return {
                "emotion": top_emotion['label'],
                "confidence": float(top_emotion['score']),
                "arousal": 0.5, # Placeholder as model is discrete emotion
                "valence": 0.5,
                "details": details,
                "timestamp": int(time.time() * 1000),
                "source": "sota_wav2vec2_model"
            }
        except Exception as e:
            print(f"Local audio inference error: {e}")
            return None


    def _predict_local_face(self, image_data: bytes):
        if 'vision_pipeline' not in self.models: return None
        try:
            img = Image.open(io.BytesIO(image_data)).convert('RGB')
            # Pipeline expects PIL Image
            results = self.models['vision_pipeline'](img)
            # format: [{'score': 0.99, 'label': 'happy'}, ...]
            
            scores = results if isinstance(results, list) else [results]
            
            top_emotion = max(scores, key=lambda x: x['score'])
            details = {item['label']: float(item['score']) for item in scores}
            
            # Map labels if needed (model specific). dima806 model uses standard labels.
            
            return {
                "overall_emotion": top_emotion['label'],
                "face_count": 1, # Pipeline assumes an image classification, so effectively 1 "scene" or face
                "confidence": float(top_emotion['score']),
                "details": details,
                "timestamp": int(time.time() * 1000),
                "source": "sota_vision_transformer"
            }
        except Exception as e:
            print(f"Local vision inference error: {e}")
            return None


    def predict_text_emotion(self, text: str) -> Dict[str, Any]:
        """Real-time text emotion analysis"""
        # 1. Try Local Model (SOTA Pipeline - Preferred)
        local_result = self._predict_local_text(text)
        if local_result: return local_result

        # 2. Try Lambda Inference
        result = EmotionInference._invoke_inference({'modality': 'text', 'text': text})
        if result and 'error' not in result:
            return result

        # 3. Fallback Simulation
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
    
    def predict_audio_emotion(self, audio_data: bytes) -> Dict[str, Any]:
        """Real-time audio emotion analysis"""
        # 1. Try Local Model (SOTA Pipeline - Preferred)
        print("🎵 Attempting Local Audio Inference...")
        local_result = self._predict_local_audio(audio_data)
        if local_result: 
            print("✅ Local Audio Success")
            return local_result

        # 2. Try Lambda Inference
        print("☁️ Attempting Lambda Audio Inference...")
        audio_b64 = base64.b64encode(audio_data).decode('utf-8')
        result = EmotionInference._invoke_inference({'modality': 'audio', 'audio': audio_b64})
        if result and 'error' not in result:
            return result

        # 3. Fallback Simulation
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
    
    def predict_face_emotion(self, image_data: bytes) -> Dict[str, Any]:
        """Real-time facial emotion analysis"""
        # 1. Try Local Model (SOTA Pipeline - Preferred)
        print("📸 Attempting Local Vision Inference...")
        local_result = self._predict_local_face(image_data)
        if local_result: 
            print("✅ Local Vision Success")
            return local_result

        # 2. Try Lambda Inference
        print("☁️ Attempting Lambda Vision Inference...")
        image_b64 = base64.b64encode(image_data).decode('utf-8')
        result = EmotionInference._invoke_inference({'modality': 'vision', 'image': image_b64})
        if result and 'error' not in result:
            return result

        # 3. Fallback Simulation
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
    request: Request,
    uid: str = Depends(get_user_id)
):
    """Real-time audio emotion detection endpoint supporting both Multipart and JSON"""
    start_time = time.time()
    
    # Check Content-Type
    content_type = request.headers.get('content-type', '')
    
    if 'multipart/form-data' in content_type:
        form = await request.form()
        file = form.get('file')
        if not file: raise HTTPException(status_code=400, detail="No file uploaded")
        audio_data = await file.read()
        filename = file.filename
    elif 'application/json' in content_type:
        data = await request.json()
        if 'audio' not in data: raise HTTPException(status_code=400, detail="Missing 'audio' field in JSON")
        # Decode Base64
        try:
            audio_data = base64.b64decode(data['audio'])
        except:
             raise HTTPException(status_code=400, detail="Invalid Base64 audio")
        filename = "base64_upload.wav"
    else:
        raise HTTPException(status_code=400, detail="Content-Type must be multipart/form-data or application/json")
    
    # Perform real-time inference
    result = emotion_inference.predict_audio_emotion(audio_data)
    
    # Log to database
    db.log_emotion(uid, 'audio', {
        'filename': filename,
        'emotion': result['emotion'],
        'confidence': result.get('confidence', 0),
        'file_size_bytes': len(audio_data)
    })
    
    # Add response metadata
    result['user_id'] = uid
    result['filename'] = filename
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

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    """WebSocket endpoint for real-time emotion streaming"""
    await websocket.accept()
    
    try:
        uid = None
        while True:
            data = await websocket.receive_json()
            
            if not uid and 'auth' in data:
                try:
            
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

