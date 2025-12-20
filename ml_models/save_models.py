import torch
import os
import sys

# Add current directory to path so we can import the models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from audio_model import AudioEmotionModel
from text_model import TextEmotionModel
from vision_model import FacialEmotionModel

def save_models():
    print("Initializing models...")
    
    # Audio Model
    print("Creating AudioEmotionModel...")
    audio_model = AudioEmotionModel(num_classes=6)
    # In a real scenario, we would load trained weights here.
    # audio_model.load_state_dict(torch.load('path/to/trained_weights.pth'))
    torch.save(audio_model.state_dict(), 'audio_model.pth')
    print("Saved audio_model.pth")

    # Text Model
    print("Creating TextEmotionModel...")
    # This will download DistilBERT weights if not cached
    text_model = TextEmotionModel(num_classes=6)
    torch.save(text_model.state_dict(), 'text_model.pth')
    print("Saved text_model.pth")

    # Vision Model
    print("Creating FacialEmotionModel...")
    vision_model = FacialEmotionModel(num_classes=7)
    torch.save(vision_model.state_dict(), 'vision_model.pth')
    print("Saved vision_model.pth")

    # Move to backend/models
    backend_models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'backend', 'models')
    if not os.path.exists(backend_models_dir):
        os.makedirs(backend_models_dir)
        print(f"Created directory: {backend_models_dir}")

    import shutil
    shutil.move('audio_model.pth', os.path.join(backend_models_dir, 'audio_model.pth'))
    shutil.move('text_model.pth', os.path.join(backend_models_dir, 'text_model.pth'))
    shutil.move('vision_model.pth', os.path.join(backend_models_dir, 'vision_model.pth'))
    
    print(f"All models moved to {backend_models_dir}")

if __name__ == "__main__":
    save_models()
