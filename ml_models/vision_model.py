import torch
import torch.nn as nn
from facenet_pytorch import MTCNN

class FacialEmotionModel(nn.Module):
    def __init__(self, num_classes=7):
        super(FacialEmotionModel, self).__init__()
        
        # We wrap MTCNN here for the pipeline, but during training/forward 
        # we assume the input is already a cropped face tensor.
        # This keeps the gradient graph clean if we fine-tune the CNN only.
        
        # Backend Feature Extractor: ResNet18-like structure (Simplified for speed)
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=3, stride=2, padding=1),
            
            self._make_layer(64, 64, 2),
            self._make_layer(64, 128, 2, stride=2),
            self._make_layer(128, 256, 2, stride=2),
            self._make_layer(256, 512, 2, stride=2),
            
            nn.AdaptiveAvgPool2d((1, 1))
        )
        
        self.classifier = nn.Linear(512, num_classes)

    def _make_layer(self, in_planes, planes, blocks, stride=1):
        layers = []
        layers.append(nn.Sequential(
            nn.Conv2d(in_planes, planes, kernel_size=3, stride=stride, padding=1, bias=False),
            nn.BatchNorm2d(planes),
            nn.ReLU()
        ))
        for _ in range(1, blocks):
            layers.append(nn.Sequential(
                nn.Conv2d(planes, planes, kernel_size=3, stride=1, padding=1, bias=False),
                nn.BatchNorm2d(planes),
                nn.ReLU()
            ))
        return nn.Sequential(*layers)

    def forward(self, x):
        # Expects [Batch, 3, 224, 224] Aligned Faces
        x = self.features(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

class EmotionDetectorPipeline:
    def __init__(self, device='cpu'):
        self.device = device
        self.mtcnn = MTCNN(keep_all=False, device=device)
        self.model = create_vision_model().to(device)
        self.model.eval()

    def predict_from_frame(self, frame_img):
        """
        End-to-end: Detect Face -> Crop -> Predict Emotion
        frame_img: PIL Image or numpy array
        """
        # MTCNN returns cropped tensor directly if return_prob=False
        face_tensor = self.mtcnn(frame_img) 
        
        if face_tensor is None:
            return None # No face detected
            
        face_tensor = face_tensor.unsqueeze(0).to(self.device) # Add batch dim
        
        with torch.no_grad():
            logits = self.model(face_tensor)
            probs = torch.softmax(logits, dim=1)
            
        return probs

def create_vision_model(num_classes=7):
    return FacialEmotionModel(num_classes=num_classes)
