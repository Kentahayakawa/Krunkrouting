import pytest
from api import create_app
from api.models import Users
import json

@pytest.fixture()
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
    })
    yield app

@pytest.fixture()
def client(app):
    return app.test_client()

@pytest.fixture()
def new_user(app):
    user = Users(username="Bob", email="K@gmail.com", password="pass")
    return user

#testing database access
def test_database(new_user):
    assert new_user.username == "Bob"
    assert new_user.email == "K@gmail.com"
    assert new_user.password == "pass"

#testing valid input of user edit
def test_user_edit(client):
    response = client.post('api/users/edit', json = {"email": "H@gmail.com"})
    assert response.status_code == 400
    assert not response.json.get("success")

#testing valid input of Get/Post
def test_bad_method(client):
    response = client.get('/api/vote')
    assert response.status_code == 405

#testing json formatting
def test_json_format(client):
    response = client.post('/api/vote', json='email')
    assert response.status_code == 400
    assert not response.json.get("success")

#testing registration function
def test_registration(client):
    response = client.post('/api/users/register', data = json.dumps{"username": "Bon"})
    assert response.status_code == 400
    assert not response.json.get("success")

#testing locations api
def test_nearby(client):
    response = client.post('/api/places', json={"address": "1000 Gayley Avenue, Los Angeles, CA"})
    assert response.status_code == 405
    assert not response.json.get("success")
