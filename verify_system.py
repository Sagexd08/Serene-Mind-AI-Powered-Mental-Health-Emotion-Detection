import sys
import os

# Add current dir to path
sys.path.append(os.getcwd())

from ml_models.text_model import create_text_model
from ml_models.audio_model import create_audio_model
from ml_models.vision_model import create_vision_model
from backend.risk_engine import RiskEngine

def test_models():
    print("Testing Model Instantiation...")
    
    try:
        txt = create_text_model()
        print("✅ Text Model created successfully")
    except Exception as e:
        print(f"❌ Text Model failed: {e}")

    try:
        aud = create_audio_model()
        print("✅ Audio Model created successfully")
    except Exception as e:
        print(f"❌ Audio Model failed: {e}")

    try:
        vis = create_vision_model()
        print("✅ Vision Model created successfully")
    except Exception as e:
        print(f"❌ Vision Model failed: {e}")
        
def test_risk_engine():
    print("\nTesting Risk Engine...")
    engine = RiskEngine()
    history = [
        {"emotion": "sadness", "intensity": 0.8},
        {"emotion": "anxiety", "intensity": 0.5},
        {"emotion": "neutral", "intensity": 1.0}
    ]
    score = engine.calculate_risk_score(history)
    rec = engine.get_recommendation(score)
    print(f"✅ Risk Score: {score:.2f}, Level: {rec['level']}")

if __name__ == "__main__":
    test_models()
    test_risk_engine()
