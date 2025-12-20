import torch
import torch.nn as nn
import torch.nn.functional as F

class AudioEmotionModel(nn.Module):
    def __init__(self, num_classes=6):
        super(AudioEmotionModel, self).__init__()
        self.conv1 = nn.Conv1d(in_channels=40, out_channels=64, kernel_size=5, stride=1, padding=2)
        self.bn1 = nn.BatchNorm1d(64)
        self.pool1 = nn.MaxPool1d(kernel_size=2)
        
        self.conv2 = nn.Conv1d(in_channels=64, out_channels=128, kernel_size=5, stride=1, padding=2)
        self.bn2 = nn.BatchNorm1d(128)
        self.pool2 = nn.MaxPool1d(kernel_size=2)
        
        self.conv3 = nn.Conv1d(in_channels=128, out_channels=256, kernel_size=5, stride=1, padding=2)
        self.bn3 = nn.BatchNorm1d(256)
        self.pool3 = nn.MaxPool1d(kernel_size=2)
        
        # LSTM Part - Temporal Modeling
        self.lstm = nn.LSTM(input_size=256, hidden_size=128, num_layers=2, batch_first=True, bidirectional=True)
        
        self.dropout = nn.Dropout(0.3)
        
        # Classifier
        self.fc = nn.Linear(128 * 2, num_classes)
        
    def forward(self, x):
        # x shape: [Batch, 40, Time] (MFCCs)
        
        x = self.pool1(F.relu(self.bn1(self.conv1(x))))
        x = self.pool2(F.relu(self.bn2(self.conv2(x))))
        x = self.pool3(F.relu(self.bn3(self.conv3(x))))
        
        # Permute for LSTM: [Batch, Features, Time] -> [Batch, Time, Features]
        x = x.permute(0, 2, 1)
        
        # LSTM
        self.lstm.flatten_parameters()
        x, (h_n, c_n) = self.lstm(x)
        
        # Take the last time step output from both directions
        # h_n shape: [Num_Layers * Num_Dirs, Batch, Hidden_Size]
        
        # Concatenate forward and backward last hidden states
        hidden = torch.cat((h_n[-2,:,:], h_n[-1,:,:]), dim = 1)
        
        x = self.dropout(hidden)
        x = self.fc(x)
        
        return x

def create_audio_model(input_channels=40, num_classes=6):
    return AudioEmotionModel(num_classes=num_classes)
