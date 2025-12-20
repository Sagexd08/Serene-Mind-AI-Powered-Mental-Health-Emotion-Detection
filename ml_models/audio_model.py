import torch
import torch.nn as nn
import numpy as np

class AudioEmotionModel(nn.Module):
    def __init__(self, num_classes=6):
        super(AudioEmotionModel, self).__init__()
        
        # Parallel 2D CNN (CRNN approach)
        # Input: (Batch, 1, 128, Time) - LogMel Spectrogram
        
        self.conv1 = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )
        
        self.conv2 = nn.Sequential(
            nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=4, stride=4)
        )
        
        self.conv3 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=4, stride=4)
        )
        
        self.conv4 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=4, stride=4)
        )
        
        # LSTM layers
        self.lstm = nn.LSTM(
            input_size=128, 
            hidden_size=128, 
            num_layers=2, 
            batch_first=True, 
            bidirectional=True
        )
        
        self.fc = nn.Linear(128 * 2, num_classes)
        
    def forward(self, x):
        # x: [Batch, 1, 128, Time]
        
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        
        # Shape: [Batch, 128, Freq, Time] -> Pool frequency, keep time for LSTM
        x = x.mean(dim=2) 
        x = x.permute(0, 2, 1) 
        
        self.lstm.flatten_parameters()
        x, _ = self.lstm(x)
        
        x = x[:, -1, :]
        
        x = self.fc(x)
        return x

def create_audio_model(num_classes=6):
    return AudioEmotionModel(num_classes=num_classes)
