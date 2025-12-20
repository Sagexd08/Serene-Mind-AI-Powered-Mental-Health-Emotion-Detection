"""
Pytest configuration and fixtures
"""
import pytest
import os
from fastapi.testclient import TestClient

# Set test environment
os.environ["FORCE_REAL_DB"] = "false"
os.environ["AWS_REGION"] = "us-east-1"
os.environ["CLERK_ISSUER_URL"] = "https://test-issuer.example.com"

@pytest.fixture
def client():
    """Create test client"""
    from main import app
    return TestClient(app)

@pytest.fixture
def mock_api_key():
    """Mock API key for testing"""
    return "sk_test_mock_key_12345"

@pytest.fixture
def mock_user_id():
    """Mock user ID"""
    return "user_test_123"
