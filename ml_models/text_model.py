import torch
import torch.nn as nn
import torch.nn.functional as F

class TextEmotionModel(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_dim, n_layers, bidirectional, dropout):
        super().__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        
        self.lstm = nn.LSTM(embedding_dim, 
                           hidden_dim, 
                           num_layers=n_layers, 
                           bidirectional=bidirectional, 
                           dropout=dropout,
                           batch_first=True)
        
        self.fc = nn.Linear(hidden_dim * 2 if bidirectional else hidden_dim, output_dim)
        
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, text, text_lengths):
        # text = [batch size, sent len]
        
        embedded = self.dropout(self.embedding(text))
        # embedded = [batch size, sent len, emb dim]
        
        # Pack sequence
        packed_embedded = nn.utils.rnn.pack_padded_sequence(embedded, text_lengths.cpu(), batch_first=True, enforce_sorted=False)
        
        packed_output, (hidden, cell) = self.lstm(packed_embedded)
        
        # Unpack sequence (not actually needed for classification using last hidden state)
        # output, output_lengths = nn.utils.rnn.pad_packed_sequence(packed_output)
        
        # hidden = [num layers * num directions, batch size, hid dim]
        
        # Concat the final forward and backward hidden layers
        if self.lstm.bidirectional:
            hidden = self.dropout(torch.cat((hidden[-2,:,:], hidden[-1,:,:]), dim = 1))
        else:
            hidden = self.dropout(hidden[-1,:,:])
            
        # hidden = [batch size, hid dim * num directions]
            
        return self.fc(hidden)

def create_text_model(vocab_size=10000, output_dim=6):
    """
    Factory function to create the standard Text Emotion Model
    Emotions: [Sadness, Anxiety, Anger, Neutral, Joy, Stress]
    """
    model = TextEmotionModel(
        vocab_size=vocab_size,
        embedding_dim=100,
        hidden_dim=256,
        output_dim=output_dim,
        n_layers=2,
        bidirectional=True,
        dropout=0.5
    )
    return model
