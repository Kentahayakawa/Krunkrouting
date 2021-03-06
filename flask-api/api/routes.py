from datetime import datetime, timezone, timedelta
from functools import wraps
from flask import request
from flask_restx import Api, Resource, fields, reqparse
import jwt, json

from .models import *
from .config import BaseConfig
from .navigation import *

rest_api = Api(version="1.0", title="Users API")

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

GetUserModel = rest_api.model(
    'GetUserModel',
    {
        "user_id": fields.String(required=True, min_length=1, max_length=32)
    }
)
@rest_api.route('/api/users')
class GetUser(Resource):
    """
    Get information about a user.
    """

    @token_required
    def post(self, current_user):
        req_data = request.get_json()
        if req_data.get("user_id"):
            _user = Users.get_by_id(req_data.get("user_id"))
            return _user.toJSON(), 200
        else:
            return current_user.toJSON(), 200

AddressModel = rest_api.model(
    'AddressModel',
    {
    }
)
@rest_api.route('/api/users/address')
class SetUserAddress(Resource):
    """
    Get information about a user.
    """

    @token_required
    def post(self, current_user):
        req_data = request.get_json()
        address = req_data.get("address")
        current_user.set_address(address)
        current_user.save()
        return {
            "success": True,
            "user": current_user.toJSON()
        }, 200

RegisterModel = rest_api.model(
    'RegisterModel',
    {
        "username": fields.String(required=True, min_length=2, max_length=32),
        "email": fields.String(required=True, min_length=4, max_length=64),
        "password": fields.String(required=True, min_length=4, max_length=16)
    }
)
@rest_api.route('/api/users/register')
class Register(Resource):
    """
    Creates a new user by taking 'signup_model' input
    """

    @rest_api.expect(RegisterModel, validate=True)
    def post(self):
        req_data = request.get_json()

        _username = req_data.get("username")
        _email = req_data.get("email")
        _password = req_data.get("password")

        user_exists = Users.get_by_email(_email)
        if user_exists:
            return {"success": False,
                    "msg": "Email already taken"}, 400

        new_user = Users(username=_username.capitalize(), email=_email)

        new_user.set_password(_password)
        new_user.save()

        new_group = Groups(new_user.id)
        new_group.save()
        new_user.join_group(new_group)
        new_user.save()

        return {"success": True,
                "userID": new_user.id,
                "group_code": new_group.invite_code,
                "msg": "The user was successfully registered"}, 200

login_model = rest_api.model(
    'LoginModel',
    {
        "email": fields.String(required=True, min_length=4, max_length=64),
        "password": fields.String(required=True, min_length=4, max_length=16)
    }
)
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

user_edit_model = rest_api.model(
    'UserEditModel',
    {
        "userID": fields.String(required=True, min_length=1, max_length=32),
        "username": fields.String(required=True, min_length=2, max_length=32),
        "email": fields.String(required=True, min_length=4, max_length=64)
    }
)
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
            current_user.update_username(_new_username)

        if _new_email:
            current_user.update_email(_new_email)

        current_user.save()

        return {"success": True}, 200

logoutUserModel = rest_api.model(
    'LogoutUserModel',
    {
    }
)
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

        current_user.set_jwt_auth_active(False)
        current_user.save()

        return {"success": True}, 200

create_group_model = rest_api.model(
    'CreateGroupModel',
    {}
)
@rest_api.route('/api/groups/create')
class CreateGroup(Resource):
    """
    Creates a group
    """

    @rest_api.expect(create_group_model)
    @token_required
    def post(self, current_user):
        old_group = current_user.group
        if not old_group == None:
            old_group.remove_member(current_user)
        new_group = Groups(current_user.id)
        new_group.save()
        current_user.join_group(new_group)
        current_user.save()

        return {
            "success": True,
            "group": new_group.toJSON()
        }, 200

join_group_model = rest_api.model(
    'JoinGroupModel',
    {
        "invite_code": fields.String(required=True, min_length=6, max_length=6)
    }
)
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
            old_group = current_user.group
            if not old_group == None:
                old_group.remove_member(current_user)
        
        current_user.join_group(_group)
        current_user.save()
        return {
            'success': True,
            'group': _group.toJSON()
        }, 200

join_group_model = rest_api.model(
    'GetGroupModel',
    {
        "group_id": fields.String(required=True, min_length=1, max_length=32)
    }
)
@rest_api.route('/api/groups')
class GetGroup(Resource):
    """
    Get information about a user.
    """

    @token_required
    def post(self, current_user):
        req_data = request.get_json()
        if req_data.get("group_id"):
            _group = Groups.get_by_id(req_data.get("group_id"))
            return {
                'success': True,
                'group': _group.toJSON()
            }, 200
        else:
            return {
                'success': True,
                'group': current_user.group.toJSON()
            }, 200

move_group_model = rest_api.model(
    'MoveGroupToNextEventModel',
    {
    }
)
@rest_api.route('/api/groups/move')
class MoveGroup(Resource):
    """
    Moves group to next event
    """

    @token_required
    def post(self, current_user):
        if current_user.id != current_user.group.leader.id:
            return {
                'success': False,
                'reason': 'MUST_BE_LEADER_TO_MOVE_GROUP'
            }, 200

        if current_user.group.current_event < len(current_user.group.events) - 1:
            current_user.group.current_event += 1
            current_user.group.save()
            return {
                'success': True,
                'group': current_user.group.toJSON()
            }, 200
        else:
            return {
                'success': False,
                'reason': 'ALREADY_AT_LAST_EVENT'
            }, 200

nearby_places_model = rest_api.model(
    'GetNearbyPlacesModel',
    {
        "name": fields.String(required=True, min_length=1, max_length=32),
        "lat": fields.String(required=True, min_length=1, max_length=32),
        "lng": fields.String(required=True, min_length=1, max_length=32),
        "distance_bias": fields.String(required=True, min_length=1, max_length=32),
        "min_price": fields.String(required=True, min_length=1, max_length=32),
        "max_price": fields.String(required=True, min_length=1, max_length=32),
        "min_rating": fields.String(required=True, min_length=1, max_length=32),
    }
)
@rest_api.route('/api/places')
class NearbyPlaces(Resource):
    """
    Get places near a location
    """


    @token_required
    def get(self, current_user):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str)
        parser.add_argument('lat', type=str)
        parser.add_argument('lng', type=str)
        parser.add_argument('distance_bias', type=float)
        parser.add_argument('min_price', type=int)
        parser.add_argument('max_price', type=int)
        parser.add_argument('min_rating', type=float)
        args = parser.parse_args()

        if args['lat'] and args['lon']:
            lat_lng = (args['lat'], args['lon'])
        elif args['name']:
            lat_lng = to_coordinates(args['name'])
        else:
            # There's no way to find out where this is!
            return {'status': 'failure', 'reason': 'neither name nor (lat, lng) was specified'}, 200

        places = get_places(
            coordinates=lat_lng,
            radius = args['distance_bias'] if args['distance_bias'] else 5000,
            min_price = args['min_price'] if args['min_price'] else 0,
            max_price = args['max_price'] if args['max_price'] else 4,
            min_rating = args['min_rating'] if args['min_rating'] else 0
        )

        # Cache places
        for place in places:
            if not Places.get_by_place_id(place['id']):
                place_sql = Places(
                    place['id'],
                    place['name'],
                    place['address'],
                    place['lat'],
                    place['lng'],
                    place['price_level'],
                    place['rating'],
                    place['user_ratings_total']
                )
                place_sql.save()
        
        return [Places.get_by_place_id(place['id']).toJSON() for place in places], 200

nearby_places_model = rest_api.model(
    'CastVote',
    {
        "place_id": fields.String(required=True, min_length=1, max_length=32),
        "choice": fields.String(required=True, min_length=1, max_length=32)
    }
)
@rest_api.route('/api/vote')
class Vote(Resource):
    """
    Cast a vote
    """

    @token_required
    def post(self, current_user):
        req_data = request.get_json()        

        vote = Votes(
                place_id=req_data.get('place_id'),
                user_id=current_user.id,
                group_id=current_user.group.id
            )

        choice = None
        try:
            choice = req_data.get('choice')
        except:
            return {"success": False, "msg": "Voting choice incorrectly formatted"}, 400

        if choice == "True":
            vote.save()
            return vote.toJSON(), 200
        elif choice == "False":
            vote.delete()
            return {"success": True, "msg": "Vote removed"}, 200
        else:
            return {"success": False, "msg": "Voting choice incorrectly formatted"}, 400

get_group_model = rest_api.model(
    'GetGroupModel',
    {
        "group_id": fields.String(required=True, min_length=1, max_length=32)
    }
)

get_event_model = rest_api.model(
    'GetEventModel',
    {
        "event_name": fields.String(required=True, min_length=1, max_length=30)
        #"time": fields.DateTime(default=datetime.utcnow)
    }
)

add_event_model = rest_api.model(
    'AddEventModel',
    {
        "name": fields.String(required=True, min_length=1, max_length=30)
        #"time": fields.DateTime(default=datetime.utcnow)
    }
)

delete_event_model = rest_api.model(
    'DeleteEventModel',
    {}
)

@rest_api.route('/api/events')
class GetEvents(Resource):
    @token_required
    def post(self, current_user):
        return {
            "success": True,
            "Events": [event.toJSON() for event in current_user.group.events]
        }, 200

@rest_api.route('/api/groups/finalize')
class FinalizeGroupVotes(Resource):
    """
    Takes the top 3 votes from a group and finalizes them into the list of "events"
    """

    @token_required
    def post(self, current_user):
        if not current_user.group.allow_voting:
            return {
                "success": True,
                "Final": [e.toJSON() for e in current_user.group.events]
            }, 200 # this is kind of weird but Prakhar wants it this way so *shrug*
        
        if current_user.id != current_user.group.leader.id:
            # Only the leader can finalize a group's votes.
            return {"success": False, "reason": "Must be leader to finalize group"}, 200
        event_place_ids = current_user.group.finalize_and_get_event_place_ids()
        current_user.group.save()
        for place_id in event_place_ids:
            event = Events(place_id, current_user.group.id)
            event.save()
        
        ordering = optimal_travel_order(current_user.group.events)
        Events.order_events(group_id=current_user.group_id, optimized_order=ordering)
        for event in current_user.group.events:
            event.save()
        
        return {"success": True,
                "Final": [e.toJSON() for e in current_user.group.events]}, 200

@rest_api.route('/api/events/checkin')
class CheckInToNextEvent(Resource):
    """
    Moves the user to the next event.
    """

    @token_required
    def post(self, current_user):
        if current_user.current_event == len(current_user.group.events) - 1:
            # Already at the last event, so we can't check in to the next one.
            return {
                'success': False,
                'reason': 'ALREADY_AT_LAST_EVENT',
                'user': current_user.toJSON()
            }
        else:
            current_user.current_event += 1
            current_user.save()
            return {
                'success': True,
                'user': current_user.toJSON()
            }

@rest_api.route('/api/events/next')
class GetNextEvent(Resource):
    """
    Gets the current and next place/address for this user.
    """

    @token_required
    def post(self, current_user):
        if current_user.current_event == -1:
            # User is at the starting address, there may not be a Place
            # associated with this. Return the coordinates of the starting location.
            next_event = current_user.group.events[0]
            return {
                'success': True,
                'start_place': None,
                'start_coords': {
                    'lat': current_user.start_lat,
                    'lng': current_user.start_lng
                },
                'end_place': next_event.place.place_id,
                'end_coords': {
                    'lat': next_event.place.lat,
                    'lng': next_event.place.lng
                }
            }, 200
        elif current_user.current_event != len(current_user.group.events) - 1:
            # User is somewhere in the middle of the crawl
            current_event = current_user.group.events[current_user.current_event]
            next_event = current_user.group.events[current_user.current_event + 1]
            return {
                'success': True,
                'start_place': current_event.place.place_id,
                'start_coords': {
                    'lat': current_event.place.lat,
                    'lng': current_event.place.lng
                },
                'end_place': next_event.place.place_id,
                'end_coords': {
                    'lat': next_event.place.lat,
                    'lng': next_event.place.lng
                }
            }, 200
        else:   
            # current_user.current_event == len(current_user.group.events)
            # When the user is at the last place on the crawl.
            current_event = current_user.group.events[current_user.current_event]
            return {
                'success': False,
                'start_place': current_event.place.place_id,
                'start_coords': {
                    'lat': current_event.place.lat,
                    'lng': current_event.place.lng
                },
                'end_place': None,
                'end_coords': None
            }, 200
