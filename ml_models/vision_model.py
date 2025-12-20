import torch
import torch.nn as nn
import torch.nn.functional as F

class SeparableConv2d(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size=3, padding=1, bias=False):
        super(SeparableConv2d, self).__init__()
        self.depthwise = nn.Conv2d(in_channels, in_channels, kernel_size=kernel_size, 
                                   groups=in_channels, padding=padding, bias=bias)
        self.pointwise = nn.Conv2d(in_channels, out_channels, kernel_size=1, bias=bias)

    def forward(self, x):
        out = self.depthwise(x)
        out = self.pointwise(out)
        return out

class FacialEmotionModel(nn.Module):
    def __init__(self, num_classes=7):
        super(FacialEmotionModel, self).__init__()
        
        # Architecture inspired by Mini-Xception for lightweight inference on Free Tier EC2
        
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(16)
        
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(32)
        
        self.block1 = nn.Sequential(
            SeparableConv2d(32, 64),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            SeparableConv2d(64, 64),
            nn.BatchNorm2d(64),
            nn.MaxPool2d(kernel_size=2)
        )
        
        self.block2 = nn.Sequential(
            SeparableConv2d(64, 128),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            SeparableConv2d(128, 128),
            nn.BatchNorm2d(128),
            nn.MaxPool2d(kernel_size=2)
        )
        
        self.conv3 = nn.Conv2d(128, num_classes, kernel_size=3, padding=1)
        
        self.global_avg_pool = nn.AdaptiveAvgPool2d(1)

    def forward(self, x):
        # Input: [Batch, 1, 48, 48] Grayscale
        
        x = F.relu(self.bn1(self.conv1(x)))
        x = F.relu(self.bn2(self.conv2(x)))
        
        x = self.block1(x)
        x = self.block2(x)
        
        x = self.conv3(x)
        x = self.global_avg_pool(x)
        
        x = x.view(x.size(0), -1) # Flatten
        
        return x

def create_vision_model(num_classes=7):
    # Emotions: Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral
    return FacialEmotionModel(num_classes=num_classes)
