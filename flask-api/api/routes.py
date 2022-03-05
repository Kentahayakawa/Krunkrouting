from datetime import datetime, timezone, timedelta
from functools import wraps
from flask import request
from flask_restx import Api, Resource, fields
import jwt

from .models import *
from .config import BaseConfig

rest_api = Api(version="1.0", title="Users API")

"""
Flask-Restx models for api request and response data
"""

signup_model = rest_api.model(
    'SignUpModel',
    {
        "username": fields.String(required=True, min_length=2, max_length=32),
        "email": fields.String(required=True, min_length=4, max_length=64),
        "password": fields.String(required=True, min_length=4, max_length=16)
    }
)

login_model = rest_api.model(
    'LoginModel',
    {
        "email": fields.String(required=True, min_length=4, max_length=64),
        "password": fields.String(required=True, min_length=4, max_length=16)
    }
)

user_edit_model = rest_api.model(
    'UserEditModel',
    {
        "userID": fields.String(required=True, min_length=1, max_length=32),
        "username": fields.String(required=True, min_length=2, max_length=32),
        "email": fields.String(required=True, min_length=4, max_length=64)
    }
)

create_group_model = rest_api.model(
    'CreateGroupModel',
    {}
)

join_group_model = rest_api.model(
    'JoinGroupModel',
    {
        "invite_code": fields.String(required=True, min_length=6, max_length=6)
    }
)

get_group_model = rest_api.model(
    'GetGroupModel',
    {
        "group_id": fields.String(required=True, min_length=1, max_length=32)
    }
)

"""
Helper function for JWT token required
"""

def token_required(f):

    @wraps(f)
    def decorator(self, *args, **kwargs):
        token = None

        if "authorization" in request.headers:
            token = request.headers["authorization"]

        if not token:
            return {"success": False, "msg": "Valid JWT token is missing"}, 400

        try:
            data = jwt.decode(token, BaseConfig.SECRET_KEY, algorithms=["HS256"])
            current_user = Users.get_by_email(data["email"])

            if not current_user:
                return {"success": False,
                        "msg": "Sorry. Wrong auth token. This user does not exist."}, 400

            token_expired = db.session.query(JWTTokenBlocklist.id).filter_by(jwt_token=token).scalar()

            if token_expired is not None:
                return {"success": False, "msg": "Token revoked."}, 400

            if not current_user.check_jwt_auth_active():
                return {"success": False, "msg": "Token expired."}, 400

        except:
            return {"success": False, "msg": "Token is invalid"}, 400

        return f(self, current_user, *args, **kwargs)

    return decorator


"""
Flask-Restx routes
"""


@rest_api.route('/api/users/register')
class Register(Resource):
    """
    Creates a new user by taking 'signup_model' input
    """

    @rest_api.expect(signup_model, validate=True)
    def post(self):
        req_data = request.get_json()

        _username = req_data.get("username")
        _email = req_data.get("email")
        _password = req_data.get("password")

        user_exists = Users.get_by_email(_email)
        if user_exists:
            return {"success": False,
                    "msg": "Email already taken"}, 400

        new_user = Users(username=_username, email=_email)

        new_user.set_password(_password)
        new_user.save()

        return {"success": True,
                "userID": new_user.id,
                "msg": "The user was successfully registered"}, 200


@rest_api.route('/api/users/login')
class Login(Resource):
    """
    Login user by taking 'login_model' input and return JWT token
    """

    @rest_api.expect(login_model, validate=True)
    def post(self):
        req_data = request.get_json()

        _email = req_data.get("email")
        _password = req_data.get("password")

        user_exists = Users.get_by_email(_email)

        if not user_exists:
            return {"success": False,
                    "msg": "This email does not exist."}, 400

        if not user_exists.check_password(_password):
            return {"success": False,
                    "msg": "Wrong credentials."}, 400

        # create access token uwing JWT
        token = jwt.encode({'email': _email, 'exp': datetime.utcnow() + timedelta(minutes=30)}, BaseConfig.SECRET_KEY)

        user_exists.set_jwt_auth_active(True)
        user_exists.save()

        return {"success": True,
                "token": token,
                "user": user_exists.toJSON()}, 200


@rest_api.route('/api/users/edit')
class EditUser(Resource):
    """
    Edits User's username or password or both using 'user_edit_model' input
    """

    @rest_api.expect(user_edit_model)
    @token_required
    def post(self, current_user):
        req_data = request.get_json()

        _new_username = req_data.get("username")
        _new_email = req_data.get("email")

        if _new_username:
            self.update_username(_new_username)

        if _new_email:
            self.update_email(_new_email)

        self.save()

        return {"success": True}, 200


@rest_api.route('/api/users/logout')
class LogoutUser(Resource):
    """
    Logs out User using 'logout_model' input
    """
    
    @token_required
    def post(self, current_user):
        _jwt_token = request.headers["authorization"]

        jwt_block = JWTTokenBlocklist(jwt_token=_jwt_token, created_at=datetime.now(timezone.utc))
        jwt_block.save()

        self.set_jwt_auth_active(False)
        self.save()

        return {"success": True}, 200

@rest_api.route('/api/groups/create')
class CreateGroup(Resource):
    """
    Creates a group
    """

    @rest_api.expect(create_group_model)
    @token_required
    def post(self, current_user):
        new_group = Groups(current_user.id)
        new_group.save()
        current_user.join_group(new_group)
        current_user.save()

        return {
            "success": True,
            "group": new_group.toJSON()
        }, 200

@rest_api.route('/api/groups/join')
class JoinGroup(Resource):
    """
    Allows a member to join a group.
    """

    @rest_api.expect(join_group_model)
    @token_required
    def post(self, current_user):
        req_data = request.get_json()
        _group = Groups.get_by_invite_code(req_data.get('invite_code'))

        print(f'User {current_user.username} (currently in group {getattr(current_user.group, "id", None)}) wants to join group {getattr(_group, "id", None)}')

        if current_user.group:
            # TODO: Any extra logic we need to leave current group.
            # For example, if the current user is the leader of the
            # group then we would need to assign a new leader.
            pass
        
        current_user.join_group(_group)
        current_user.save()
        return {
            'success': True,
            'group': _group.toJSON()
        }, 200

@rest_api.route('/api/groups')
class Group(Resource):
    """
    Get information about a group.
    """
    
    @rest_api.expect(get_group_model)
    # No token required for now, to make it easier to debug.
    def post(self):
        req_data = request.get_json()
        _group = Groups.get_by_id(req_data.get('group_id'))

        return _group.toJSON(), 200