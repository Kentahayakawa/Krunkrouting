from mimetypes import init
import pytest
from api import create_app, db
from api.models import Users
import json
import os

@pytest.fixture()
def app():
    app = create_app('api.config.TestConfig')
    with app.app_context():
        db.create_all()
    app.config.update({
        "TESTING": True,
    })
    yield app

@pytest.fixture()
def client(app):
    return app.test_client()

@pytest.fixture()
def mock_leader_token(client):
    result = client.post(
        'api/users/register',
        json = {
            'username': 'eggert',
            'password': 'eggert',
            'email': 'eggert@eggert.com'
        }
    )
    if not result.json['success']:
        pass # just means this isn't the first time we ran this fixture

    result = client.post(
        'api/users/login',
        json = {
            'email': 'eggert@eggert.com',
            'password': 'eggert'
        }
    )
    assert result.json['success']
    return result.json['token']

@pytest.fixture()
def mock_member_token(client):
    result = client.post(
        'api/users/register',
        json = {
            'username': 'prakhar',
            'password': 'prakhar',
            'email': 'prakhar@prakhar.com'
        }
    )
    if not result.json['success']:
        pass # just means this isn't the first time we ran this fixture

    result = client.post(
        'api/users/login',
        json = {
            'email': 'prakhar@prakhar.com',
            'password': 'prakhar'
        }
    )
    assert result.json['success']
    return result.json['token']

@pytest.fixture()
def mock_group_invite_code(client, mock_leader_token):
    result = client.post(
        'api/users',
        json = {
            'user_id': 1
        },
        headers = {
            'Authorization': mock_leader_token
        }
    )
    print(result.json)
    return result.json['_group_invite_code']

def test_user_edit(client, mock_leader_token):
    response = client.post(
        'api/users/edit',
        json = {
            'username': 'edited_eggert'
        },
        headers = {
            'Authorization': mock_leader_token
        }
    )
    assert response.json['success']

def test_group_join(client, mock_member_token, mock_group_invite_code):
    response = client.post(
        'api/groups/join',
        json = {
            'invite_code': mock_group_invite_code
        },
        headers = {
            'Authorization': mock_member_token
        }
    )
    assert response.json['success']
    assert response.json['group']['invite_code'] == mock_group_invite_code

def test_cast_vote(client, mock_member_token, mock_group_invite_code):
    ROCCOS = 'ChIJG8E_l4O8woARfo9O-8qHCuk'
    response = client.post(
        'api/vote',
        json = {
            'place_id': ROCCOS,
            'choice': 'True'
        },
        headers = {
            'Authorization': mock_member_token
        }
    )
    response = client.post(
        'api/groups',
        json = {

        },
        headers = {
            'Authorization': mock_member_token
        }
    )
    assert response.json['group']['votes'][ROCCOS]['num_votes'] == 1

def test_finalize(client, mock_leader_token):
    response = client.post(
        'api/groups/finalize',
        json = {
        },
        headers = {
            'Authorization': mock_leader_token
        }
    )
    assert response.json['success']

def test_checkin(client, mock_member_token):
    response = client.post(
        'api/users',
        json = {
        },
        headers = {
            'Authorization': mock_member_token
        }
    )
    old_user_data = response.json
    response = client.post(
        'api/events/checkin',
        json = {
        },
        headers = {
            'Authorization': mock_member_token
        }
    )
    assert old_user_data['current_event_index'] != response.json['user']['current_event_index']

#testing json formatting
def test_json_format(client):
    response = client.post('/api/vote', json='email')
    assert response.status_code == 400
    assert not response.json.get("success")

#testing registration function
def test_registration(client):
    response = client.post('/api/users/register', data = json.dumps({"username": "Bon"}))
    assert response.status_code == 400
    assert not response.json.get("success")

#testing locations api
def test_nearby(client):
    response = client.post('/api/places', json={"address": "1000 Gayley Avenue, Los Angeles, CA"})
    assert response.status_code == 405
    assert not response.json.get("success")

@pytest.fixture(scope="session", autouse=True)
def cleanup(request):
    """Cleanup a testing directory once we are finished."""
    def remove_test_db():
        os.remove(os.path.join(os.getcwd(), 'api/testapidata.db'))
    request.addfinalizer(remove_test_db)