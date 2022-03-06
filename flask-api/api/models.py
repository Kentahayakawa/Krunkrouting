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

    #events = db.relationship('Events', backref=db.backref('groups'))

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

    def remove_member(self, member):
        """
        Removes a user from the member list when user leaves the group.
        """
        members = []
        for keepmember in self.mebers:
            if keepmember.id != member.id:
                members.append(keepmember)
        self.members = members

        if (self.leader_id == member.id):
            if(len(members) != 0):
                self.leader_id = members[0].id
            else:
                db.session.query(self).delete()
        
        db.session.commit()

    @classmethod
    def get_by_invite_code(cls, invite_code):
        return cls.query.filter_by(invite_code=invite_code).first()

    def tallyVotes(self):
            tally = defaultdict(lambda: 0)
            for vote in self.votes:
                tally[vote.place_id] += 1
            return {k: v for k, v in sorted(tally.items(), key=lambda item: item[1], reverse=True)}

    def toJSON(self):
        result = {}
        result['_id'] = self.id
        result['invite_code'] = self.invite_code
        result['leader'] = self.leader.toJSON()
        result['members'] = [member.toJSON() for member in self.members]
        result['votes'] = self.tallyVotes()
        result['events'] = [event.toJSON() for event in self.events]
        return result

class Votes(db.Model):
    id = db.Column(db.Integer(), primary_key=True)
    place_id = db.Column(db.String(32), nullable=False)

    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('Users', backref=db.backref('votes', lazy=True), foreign_keys=[user_id])

    group_id = db.Column(db.Integer(), db.ForeignKey('groups.id'))
    group = db.relationship('Groups', backref=db.backref('votes', lazy=True), foreign_keys=[group_id])

    def save(self):
        # Check for double voting; We only want one vote per user & bar.
        exists = self.find_vote(self.user_id, self.place_id)
        if exists is None:
            db.session.add(self)
            db.session.commit()
    
    def delete(self):
        # Make sure vote actually exists before you try to delete it.
        exists = self.find_vote(self.user_id, self.place_id)
        if exists is not None:
            db.session.delete(exists)
            db.session.commit()

    
    @classmethod
    def find_vote(cls, user_id, place_id):
        found_vote = db.session.query(Votes).filter(Votes.user_id==user_id, Votes.place_id==place_id).first()
        return found_vote 

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
    rating = db.Column(db.Integer(), nullable=False)
    price_level = db.Column(db.Integer(), nullable=False)
    place_id = db.Column(db.Text(), nullable=False)

    #set after votings are over, use distance matrix
    event_ordering = db.Column(db.Integer(), nullable=False) 
    
    group_id = db.Column(db.Integer(), db.ForeignKey('groups.id'))
    groups = db.relationship('Groups', backref=db.backref('events', lazy=True), foreign_keys=[group_id])

    def __repr__(self) -> str:
        return f"Event {self.id} {self.name}"# {self.time}"

    def save(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def delete(cls, place_id):
        exists = db.session.query(Events).filter(Events.place_id == place_id).first()
        if exists is not None:
            db.session.delete(exists)
            db.session.commit()

    def get_by_id(cls, id):
        return cls.query.get_or_404(id)

    @classmethod
    def order_events(cls, group_id):
        #modify db entries for all events corresponding to provided group id so that event ordering goes from
        # 1 to n by distance
        pass
    
    @classmethod
    def finalize_events(cls, group_id, num_events):
        ''' Sort the events by number of votes they received. Keep the first
            num_events amount of events and remove the rest as they aren't 
            popular enough to keep.'''
        group = Groups.get_by_id(group_id)
        votes = group.tallyVotes()
        votes = dict(sorted(votes.items(), key=lambda x:x[1]))
        drop_events = list(votes.keys())

        # Skipping over the most popluar events
        for i in range(num_events):
            drop_events.pop()
        
        # Then remove the rest
        for bar in drop_events:
            cls.delete(bar)
        

    def toJSON(self):
        result = {}
        result['id'] = self.id
        result['name'] = self.name
        result['group_id'] = self.group_id
        result['price_level'] = self.price_level
        result['place_id'] = self.place_id
        result['event_ordering'] = self.event_ordering
        result['group_id'] = self.group_id
        return result
