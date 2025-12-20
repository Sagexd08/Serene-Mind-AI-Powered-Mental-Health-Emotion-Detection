import torch.nn as nn
from transformers import DistilBertModel, DistilBertConfig

class TextEmotionModel(nn.Module):
    def __init__(self, num_classes=6, frozen=True):
        super(TextEmotionModel, self).__init__()
        # Use DistilBERT for efficiency on Free Tier/Latency sensitive
        self.bert = DistilBertModel.from_pretrained('distilbert-base-uncased')
        
        if frozen:
            for param in self.bert.parameters():
                param.requires_grad = False
                
        self.classifier = nn.Sequential(
            nn.Linear(768, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, input_ids, attention_mask):
        # DistilBERT Output: last_hidden_state (batch, seq_len, 768)
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        
        # Take the [CLS] token representation (first token)
        cls_token = outputs.last_hidden_state[:, 0, :]
        
        logits = self.classifier(cls_token)
        return logits

def create_text_model(num_classes=6):
    """
    Factory to create DistilBERT based classifier.
    """
    return TextEmotionModel(num_classes=num_classes)
