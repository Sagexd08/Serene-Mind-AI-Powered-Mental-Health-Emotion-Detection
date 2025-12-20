"""
Test authentication and authorization
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi import status

class TestAuthentication:
    """Test authentication mechanisms"""
    
    def test_api_key_auth(self, client, mock_api_key, mock_user_id):
        """Test API key authentication"""
        # Mock the API key service
        with patch('main.api_key_service.verify_key') as mock_verify:
            mock_verify.return_value = {'user_id': mock_user_id, 'is_active': True}
            
            response = client.post(
                "/emotion/text",
                json={"text": "Test text"},
                headers={"x-api-key": mock_api_key}
            )
            assert response.status_code == status.HTTP_200_OK
            mock_verify.assert_called_once_with(mock_api_key)
    
    def test_invalid_api_key(self, client):
        """Test invalid API key returns 401"""
        with patch('main.api_key_service.verify_key') as mock_verify:
            mock_verify.return_value = None
            
            response = client.post(
                "/emotion/text",
                json={"text": "Test text"},
                headers={"x-api-key": "invalid_key"}
            )
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_x_user_id_fallback(self, client, mock_user_id):
        """Test x-user-id header fallback"""
        response = client.post(
            "/emotion/text",
            json={"text": "Test text"},
            headers={"x-user-id": mock_user_id}
        )
        assert response.status_code == status.HTTP_200_OK

class TestAPIKeyManagement:
    """Test API key CRUD operations"""
    
    def test_create_api_key_requires_auth(self, client):
        """Test creating API key requires authentication"""
        response = client.post(
            "/api-keys",
            json={"label": "Test Key"}
        )
        # Should fail without Bearer token
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
    
    def test_list_api_keys_requires_auth(self, client):
        """Test listing API keys requires authentication"""
        response = client.get("/api-keys")
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
