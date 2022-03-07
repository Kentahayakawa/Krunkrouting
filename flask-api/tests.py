import pytest
from api import app
from api.models import Users


@pytest.fixture()
def client():
    return app.test_client()

@pytest.fixture()
def new_user():
    user = Users(username="Bob", email="K@gmail.com", password="pass")
    return user

    
def test_database(new_user):
    assert new_user.username == "Bob"
    assert new_user.email == "K@gmail.com"
    assert new_user.password == "pass"

def test_user_edit(client):
    response = client.post('api/users/register', json = {"email": "H@gmail.com"})
    assert response.status_code == 400
    assert not response.json.get("success")

def test_bad_method(client):
    response = client.get('/api/vote')
    assert response.status_code == 405

def test_json_format(client):
    response = client.post('/api/vote', json='email')
    assert response.status_code == 400
    assert not response.json.get("success")

def test_registration(client):
    response = client.post('/api/users/register', json={"username": "Bon", "email": "gg@gmail.com", "password": "pass"})
    assert response.status_code == 400

def test_nearby(client):
    response = client.post('/api/places', json={"address": "1000 Gayley Avenue, Los Angeles, CA"})
    assert response.status_code == 405
    assert not response.json.get("success")
