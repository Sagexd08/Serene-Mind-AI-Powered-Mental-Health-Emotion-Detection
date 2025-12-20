"""
Test API endpoints
"""
import pytest
from fastapi import status

class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test root endpoint returns healthy status"""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "active"
        assert "access" in data

class TestEmotionEndpoints:
    """Test emotion analysis endpoints"""
    
    def test_text_emotion_with_user_id(self, client, mock_user_id):
        """Test text emotion analysis with x-user-id header"""
        response = client.post(
            "/emotion/text",
            json={"text": "I am feeling great today!"},
            headers={"x-user-id": mock_user_id}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "emotion" in data
        assert "confidence" in data
    
    def test_text_emotion_without_auth(self, client):
        """Test text emotion analysis fails without authentication"""
        response = client.post(
            "/emotion/text",
            json={"text": "I am feeling great today!"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_audio_emotion_with_user_id(self, client, mock_user_id):
        """Test audio emotion analysis"""
        # Create mock audio file
        files = {"file": ("test.wav", b"fake audio data", "audio/wav")}
        response = client.post(
            "/emotion/audio",
            files=files,
            headers={"x-user-id": mock_user_id}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "emotion" in data
    
    def test_face_emotion_with_user_id(self, client, mock_user_id):
        """Test facial emotion analysis"""
        files = {"file": ("test.jpg", b"fake image data", "image/jpeg")}
        response = client.post(
            "/emotion/face",
            files=files,
            headers={"x-user-id": mock_user_id}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "emotion" in data
        assert "confidence" in data

class TestRiskScoring:
    """Test risk scoring endpoint"""
    
    def test_risk_score_with_user_id(self, client, mock_user_id):
        """Test risk score calculation"""
        response = client.post(
            "/risk/score",
            json={"user_id": mock_user_id},
            headers={"x-user-id": mock_user_id}
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "risk_score" in data
        assert "level" in data
        assert "recommendation" in data

class TestResources:
    """Test resources endpoint"""
    
    def test_get_resources(self, client):
        """Test resources endpoint returns data"""
        response = client.get("/resources")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "crisis_line" in data
        assert "articles" in data
