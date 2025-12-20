# SereneMind: AI-Driven Mental Health Support System

> **Disclaimer:** SereneMind is an emotional support tool, not a medical device. It does not provide medical diagnoses. If you are in crisis, please contact your local emergency services or a mental health professional immediately.

## 🌟 Overview
SereneMind is a privacy-first, multimodal mental health support platform designed to be calm, empathetic, and accessible. It leverages advanced Machine Learning to detect emotional states from **text**, **speech**, and **facial expressions**, providing personalized coping strategies and tracking emotional trends over time.

Built entirely on **AWS Free Tier**, this system demonstrates enterprise-grade architecture suitable for real-world deployment while prioritizing user privacy and ethical AI practices.

## 🎯 Key Features
- **Multimodal Emotion Detection**: Real-time analysis of text (Natural Language Processing), voice (Audio Signal Processing), and facial expressions (Computer Vision).
- **Risk Scoring & Trend Engine**: Transparent, explainable risk assessment to track emotional volatility and alert users to potential burnout or distress.
- **Empathetic AI Interface**: A calming, "non-triggering" UI designed to reduce cognitive load and anxiety.
- **Privacy-First Architecture**: End-to-end encryption, on-device options, and strict data opt-in policies.
- **Resource Recommendation**: Context-aware suggestions for breathing exercises, journaling, or professional help.

## 🏗️ Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS (Pastelhues), Framer Motion
- **Backend**: Python (FastAPI/Mangum), AWS Lambda
- **Machine Learning**: PyTorch (Bi-LSTM for text, CNN+LSTM for audio, MobileNet for vision)
- **Database**: AWS DynamoDB (Single-table design)
- **Infrastructure**: AWS S3, CloudFront, API Gateway, Cognito, EC2 (t2.micro for inference)

## 🔐 Ethics & Privacy
- **Opt-In/Opt-Out**: Users have full control over their data.
- **Data Deletion**: "Right to be forgotten" is implemented at the database level.
- **Transparent AI**: Risk scores are explained in human-readable terms, avoiding "black box" anxiety.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- AWS Account (Free Tier eligible)

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/serenemind.git
   cd serenemind
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📄 License
MIT License. Open for educational and non-commercial portfolio use.
