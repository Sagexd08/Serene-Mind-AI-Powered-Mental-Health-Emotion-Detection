from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import datetime
import random # For mocking inference until weights are loaded

app = FastAPI(title="SereneMind API", description="Multimodal Mental Health Emotion Detection")

# --- Data Models ---
class TextInferenceRequest(BaseModel):
    text: str
    user_id: str

class RiskAssessmentRequest(BaseModel):
    user_id: str
    recent_emotions: List[str]

class EmotionalTrend(BaseModel):
    date: str
    dominant_emotion: str
    intensity: float

# --- Routes ---

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "SereneMind Backend"}

@app.post("/predict/text")
def predict_text_emotion(request: TextInferenceRequest):
    """
    Analyzes text input for 6 emotion classes.
    Uses the Bi-LSTM model (mocked for now).
    """
    # TODO: Load actual model and vocab
    emotions = ["sadness", "anxiety", "anger", "neutral", "joy", "stress"]
    probabilities = {emo: random.random() for emo in emotions}
    
    # Normalize
    total = sum(probabilities.values())
    probabilities = {k: v/total for k, v in probabilities.items()}
    
    dominant = max(probabilities, key=probabilities.get)
    
    return {
        "emotion": dominant,
        "probabilities": probabilities,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.post("/predict/audio")
async def predict_audio_emotion(file: UploadFile = File(...)):
    """
    Analyzes audio file (wav/webm) for emotion.
    Uses CNN+LSTM model.
    """
    return {"status": "mocked", "emotion": "calm", "intensity": 0.4}

@app.post("/predict/face")
async def predict_face_emotion(file: UploadFile = File(...)):
    """
    Analyzes image frame for facial emotion.
    Uses MobileNet-like model.
    """
    return {"status": "mocked", "emotion": "neutral", "confidence": 0.85}

@app.post("/risk/assess")
def assess_risk(request: RiskAssessmentRequest):
    """
    Calculates risk score based on recent history.
    """
    # Simple heuristic for demo
    negative_count = sum(1 for e in request.recent_emotions if e in ["sadness", "anger", "anxiety"])
    total = len(request.recent_emotions) if request.recent_emotions else 1
    
    risk_score = (negative_count / total) * 100
    
    risk_level = "Low"
    if risk_score > 30: risk_level = "Medium"
    if risk_score > 70: risk_level = "High"
    
    return {
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "suggestion": "Take a deep breath." if risk_level == "Low" else "Consider talking to someone."
    }
