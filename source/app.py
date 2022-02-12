# Reference: https://realpython.com/flask-google-login/
from enum import unique
import json
import os
import sqlite3

from flask import Flask, redirect, request, url_for
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user
)
from oauthlib.oauth2 import WebApplicationClient
import requests

from db import init_db_command
from user import User

# TODO: In a real project we would want to use environment variables. But since this is a
# private repository, it is okay to keep it here.
GOOGLE_CLIENT_ID = '1001110866170-8jld6v8raa7aj5fcn5lp5ukv22ckp2cb.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET = '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'
GOOGLE_DISCOVERY_URL = 'https://accounts.google.com/.well-known/openid-configuration'
def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()

# Setup Flask and the login manager
app = Flask(__name__)
app.secret_key = 'this should also be an environment variable, oh well... maybe one day'
login_manager = LoginManager()
login_manager.init_app(app)
# Setup login hjelper
@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)

# Setup the database
try:
    init_db_command()
except sqlite3.OperationalError:
    # 'Assume it's already been created'
    pass

# Setup OAuth 2
client = WebApplicationClient(GOOGLE_CLIENT_ID)

@app.route('/')
def index():
    if current_user.is_authenticated:
        return (
            '<p>Hello, {}! You\'re logged in! Email: {}</p>'
            '<div><p>Google Profile Picture:</p>'
            '<img src="{}" alt="Google profile pic"></img></div>'
            '<a class="button" href="/logout">Logout</a>'.format(
                current_user.name, current_user.email, current_user.profile_pic
            )
        )
    else:
        return '<a class="button" href="/login">Google Login</a>'

@app.route('/login')
def login():
    # Find out what URL to hit for Google login
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg['authorization_endpoint']

    # Use library to construct the request for Google login and provide
    # scopes that let you retrieve user's profile from Google
    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + '/callback',
        scope=['openid', 'email', 'profile'],
    )
    return redirect(request_uri)

@app.route('/login/callback')
def callback():
    """
    Source code for this is taken from https://realpython.com/flask-google-login/
    It seems like it's a lot of boilerplate, so I didn't put too much effort into
    understanding it. Make sure to move it to its own file later.
    """
    # Get authorization code Google sent back to you
    code = request.args.get('code')

    # Find out what URL to hit to get tokens that allow you to ask for
    # things on behalf of a user
    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg['token_endpoint']

    # Prepare and send a request to get tokens
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code
    )
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )

    # Parse the tokens
    client.parse_request_body_response(json.dumps(token_response.json()))

    # Now that you have tokens let's find and hit the URL
    # from Google that gives you the user's profile information,
    # including their Google profile image and email
    userinfo_endpoint = google_provider_cfg['userinfo_endpoint']
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    # You want to make sure their email is verified.
    # The user authenticated with Google, authorized your
    # app, and now you've verified their email through Google!
    if userinfo_response.json().get("email_verified"):
        unique_id = userinfo_response.json()["sub"]
        user_email = userinfo_response.json()["email"]
        picture = userinfo_response.json()["picture"]
        user_name = userinfo_response.json()["given_name"]
    else:
        return "User email not available or not verified by Google.", 400

    if not User.get(unique_id):
        User.create(unique_id, user_name, user_email, picture)

    user = User.get(unique_id)

    login_user(user)

    return redirect(url_for('index'))

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(ssl_context="adhoc")