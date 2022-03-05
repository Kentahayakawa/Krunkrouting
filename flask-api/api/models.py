from datetime import datetime
from email.policy import default
import random
import string
from collections import defaultdict
import json

from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Users(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    username = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(64), nullable=False)
    password = db.Column(db.Text())
    jwt_auth_active = db.Column(db.Boolean())
    date_joined = db.Column(db.DateTime(), default=datetime.utcnow)
    
    group_id = db.Column(db.Integer(), db.ForeignKey('groups.id'))
    group = db.relationship('Groups', backref=db.backref('members', lazy=True), foreign_keys=[group_id])

    def __repr__(self):
        return f"User {self.username}"

    def save(self):
        db.session.add(self)
        db.session.commit()

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def update_email(self, new_email):
        self.email = new_email

    def update_username(self, new_username):
        self.username = new_username

    def join_group(self, new_group):
        self.group_id = new_group.id

    def get_group_id(self):
        return self.group_id
    
    def check_jwt_auth_active(self):
        return self.jwt_auth_active

    def set_jwt_auth_active(self, set_status):
        self.jwt_auth_active = set_status

    @classmethod
    def get_by_id(cls, id):
        return cls.query.get_or_404(id)

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

    def toJSON(self):
        result = {}
        result['_id'] = self.id
        result['username'] = self.username
        result['email'] = self.email
        result['group_id'] = self.group_id
        result['votes'] = [v.place_id for v in self.votes]
        return result

class Groups(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    invite_code = db.Column(db.String(6), nullable=False, unique=True)

    leader_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)
    leader = db.relationship('Users', foreign_keys=[leader_id])

    def __init__(self, leader_id):
        self.leader_id = leader_id
        self.invite_code = self._get_unused_invite_code()

    def __repr__(self) -> str:
        return f"Group {self.id} (leader: {self.leader.username})"
    
    def save(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def get_by_id(cls, id):
        return cls.query.get_or_404(id)
        
    def _get_unused_invite_code(self):
        """
        Generates random invite codes until it finds an unused one, and then returns that.
        """
        def gen_invite_code():
            return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        result = gen_invite_code()
        while(Groups.get_by_invite_code(result)):
            result = gen_invite_code()
        return result

    @classmethod
    def get_by_invite_code(cls, invite_code):
        return cls.query.filter_by(invite_code=invite_code).first()

    def toJSON(self):
        def tallyVotes():
            tally = defaultdict(lambda: 0)
            for vote in self.votes:
                tally[vote.place_id] += 1
            return {k: v for k, v in sorted(tally.items(), key=lambda item: item[1], reverse=True)}

        result = {}
        result['_id'] = self.id
        result['invite_code'] = self.invite_code
        result['leader'] = self.leader.toJSON()
        result['members'] = [member.toJSON() for member in self.members]
        result['votes'] = tallyVotes()
        return result

class Votes(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    place_id = db.Column(db.String(32), nullable=False)

    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('Users', backref=db.backref('votes', lazy=True), foreign_keys=[user_id])

    group_id = db.Column(db.Integer(), db.ForeignKey('groups.id'))
    group = db.relationship('Groups', backref=db.backref('votes', lazy=True), foreign_keys=[group_id])

    def save(self):
        db.session.add(self)
        db.session.commit()

    def toJSON(self):
        return {'user_id': self.user_id, 'place_id': self.place_id}

class JWTTokenBlocklist(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    jwt_token = db.Column(db.String(), nullable=False)
    created_at = db.Column(db.DateTime(), nullable=False)

    def __repr__(self):
        return f"Expired Token: {self.jwt_token}"

    def save(self):
        db.session.add(self)
        db.session.commit()



class Events(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(), nullable=False)
    #time = db.Column(db.DateTime(), default=datetime.utcnow)
    
    event_group_id = db.Column(db.Integer(), db.ForeignKey('groups.id'))
    group = db.relationship('Groups', backref=db.backref('events', lazy=True), foreign_keys=[event_group_id])

    def __init__(self, event_name):#, event_time):
        self.name = event_name
        #self.time = event_time
        
    def __repr__(self) -> str:
        return f"Event {self.id} {self.name}"# {self.time}"

        
    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        exists = db.session.query(Events).filter(Events.name == self.name).first()
        if exists is not None:
            db.session.delete(exists)
            db.session.commit()

    def get_by_id(cls, id):
        return cls.query.get_or_404(id)

    def toJSON(self):
        result = {}
        result['name'] = self.name
        #result['time'] = self.time
        return result
