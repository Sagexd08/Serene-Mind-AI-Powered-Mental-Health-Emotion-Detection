# SereneMind: Private & Anonymous Mental Health AI

> **Disclaimer:** SereneMind is an emotional support tool, not a medical device. It does not provide medical diagnoses. If you are in crisis, please contact your local emergency services immediately.

## 🌟 Overview
SereneMind is a **privacy-first**, anonymous-by-default mental health tracking system using AWS and Multimodal AI.
- **No Login Required**: Users are identified by a locally generated UUID.
- **On-Device First**: We aim to process as much as possible privately.
- **Multimodal**: Analyzes Text (NLP), Voice (Audio), and Facial Expressions.

## 🏗️ System Architecture & Workflow

![System Workflow](./41598_2025_89202_Fig1_HTML.png)

## 1. High-Level Architecture (AWS Free Tier)

The system is designed to act as a hybrid serverless/microservices architecture to maximize Free Tier usage while handling compute-intensive ML tasks.

```mermaid
graph TD
    User[User (Browser/Mobile)] -->|HTTPS| CF[CloudFront CDN]
    CF -->|Static Assets| S3[S3 Bucket (Frontend)]
    User -->|API Requests| APIG[API Gateway]
    
    subgraph "Authentication"
        APIG -->|Auth| Cognito[AWS Cognito]
    end
    
    subgraph "Serverless Backend (Lightweight)"
        APIG -->|REST| Lambda[AWS Lambda (Python)]
        Lambda -->|Read/Write| DDB[DynamoDB]
        Lambda -->|Inference| TextModel[Text Emotion Model (Bi-LSTM)]
        Lambda -->|Risk Logic| RiskEngine[Risk Scoring Engine]
    end
    
    subgraph "Compute Backend (Heavyweight)"
        APIG -->|WebSocket/HTTP| EC2[EC2 t2.micro]
        EC2 -->|Inference| AudioModel[Speech Emotion Model (CNN+LSTM)]
        EC2 -->|Inference| VisionModel[Facial Emotion Model (MobileNet)]
        EC2 -->|Logs| CW[CloudWatch]
    end
```

## 2. Component Design

### 2.1. Frontend (Client-Side)
- **Framework**: Next.js (Static Export).
- **Hosting**: AWS S3 + CloudFront.
- **Responsibility**: 
    - UX for Check-in, Dashboard, and Resources.
    - Capturing webcam frames (throttled to 1fps) and audio snippets.
    - Pre-processing inputs before sending to backend.

### 2.2. Backend APIs
- **Text Analysis (Lambda)**: 
    - Stateless efficient execution.
    - Loads quantized Bi-LSTM model from S3 or Layer.
- **Multimodal Analysis (EC2 - t2.micro)**:
    - Runs a persistent FastAPI server.
    - Handles audio (MFCC extraction) and image (Face detection + Classification).
    - *Why EC2?* Specialized library dependencies (OpenCV, Librosa) and model loading latency make Lambda tricky/slow for these on the free tier.

### 2.3. Data Storage (DynamoDB)
**Table**: `SereneMind_Data`
**PK**: `PartitionKey` (e.g., `USER#<sub_id>`)
**SK**: `SortKey` (e.g., `ENTRY#<timestamp>`, `METADATA#profile`)

| Entity | PK | SK | Attributes |
| :--- | :--- | :--- | :--- |
| **User Profile** | `USER#<id>` | `PROFILE` | `email`, `settings`, `privacy_consent` |
| **Emotion Log** | `USER#<id>` | `LOG#<iso_date>` | `text_emotion`, `voice_emotion`, `face_emotion`, `risk_score` |
| **Risk Trend** | `USER#<id>` | `TREND#<week_id>` | `volatility_index`, `avg_mood` |

## 3. Machine Learning Pipelines

### 3.1. Text Emotion Detection (NLP)
- **Input**: Raw text string.
- **Preprocessing**: Tokenization, lowercasing, stop-word removal.
- **Model**: Bi-Directional LSTM with Attention Mechanism.
- **Output**: Softmax probability over 6 classes: `[Sadness, Anxiety, Anger, Neutral, Joy, Stress]`.

### 3.2. Speech Emotion Detection (Audio)
- **Input**: `.wav` / `.webm` audio chunk (5s).
- **Preprocessing**: 
    - Resampling to 16kHz.
    - Feature Extraction: Mel-Frequency Cepstral Coefficients (MFCCs).
- **Model**: 1D CNN (for local features) + LSTM (for temporal dependencies).
- **Output**: Intensity (Valence/Arousal) + Class.

### 3.3. Facial Emotion Recognition (Vision)
- **Input**: Base64 image frame.
- **Preprocessing**: 
    - Face detection via Haar Cascades or MTCNN (lightweight).
    - Grayscale conversion & resizing (48x48).
- **Model**: MobileNetV2 (Pre-trained & Fine-tuned) or ResNet18 (Feature extractor).
- **Output**: 7 classes (Ekman's basic emotions).

## 4. Risk Scoring & Algorithm
The **Risk Engine** calculates a composite score (0-100):
`Risk = (w1 * Text_Negativity) + (w2 * Voice_Stress) + (w3 * Face_Sadness) + (w4 * Volatility_Index)`

- **Low (0-30)**: Normal fluctuation. Suggest: "Daily Journaling".
- **Medium (31-70)**: Elevated stress. Suggest: "Breathing Exercise", "Walk".
- **High (71-100)**: Sustained distress. Suggest: "Talk to Human", "Helpline".

## 5. Security & Privacy
- **Encryption**: KMS for S3 buckets, HTTPS for all transport.
- **Auth**: Cognito User Pools with JWT verification on API Gateway.
- **Anonymity**: User IDs are UUIDs; no mapping to real names in the logs table.

## 🔐 Privacy & Anonymity
- Users are assigned a random UUID on first visit.
- No email, phone number, or name is ever requested.
- Data is stored under this random UUID.
- Deleting browser cache ("forgetting" the UUID) effectively deletes access to the history, acting as a "Kill Switch" for privacy.

## 📊 Model Performance

The system utilizes three distinct models for multimodal emotion detection. Below are the performance metrics based on the evaluation dataset.

### 📝 Text Emotion Model (DistilBERT)
- **Accuracy**: 91%
- **F1-Score**: 0.91
- **Classes**: Joy, Sadness, Anger, Fear, Love, Surprise

### 🎙️ Audio Emotion Model (CRNN)
- **Accuracy**: 87%
- **F1-Score**: 0.87
- **Classes**: Neutral, Calm, Happy, Sad, Angry, Fearful, Disgust, Surprised

### 📸 Facial Emotion Model (MTCNN + ResNet)
- **Accuracy**: 88%
- **F1-Score**: 0.88
- **Classes**: Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral

*Full evaluation reports and confusion matrices are available in the `model_evaluation/` directory.*

## 🚀 Getting Started

### 1. Environment Setup
Create a single `.env` file in the **root directory** with all configuration:
```
# AWS Configuration
AWS_REGION=eu-north-1
EMOTION_LOGS_TABLE=EmotionLogs
RISK_SUMMARY_TABLE=RiskSummary
MODEL_BUCKET=serene-mind-models

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2. Run Locally
```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm run dev
```

### 3. Usage
Open `http://localhost:3000`. You can now sign in using Clerk authentication.

## 🚀 Deployment

### Deploy Frontend to Vercel
See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete deployment instructions.

Quick steps:
```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# Import to Vercel and add environment variables from .env.example
```

### Deploy Models to S3/CDN
Ensure you have AWS credentials set up, then run:
```bash
python deployment/deploy_ml.py
```

### Deploy Backend to EC2
SSH into your instance using your key pair:
```bash
ssh -i "serene-mind-ec2-key.pem" ec2-user@ec2-13-60-229-227.eu-north-1.compute.amazonaws.com
```

Then copy the `backend/` folder and run the server:
```bash
# On EC2 instance
git clone https://github.com/your-repo/serene-mind.git
cd serene-mind/backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```


