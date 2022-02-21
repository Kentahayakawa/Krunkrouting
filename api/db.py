# https://realpython.com/flask-google-login/
# http://flask.pocoo.org/docs/1.0/tutorial/database/
import sqlite3
from chardet import detect
import click
from flask import Flask, current_app, g
from flask.cli import with_appcontext

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            'sqlite_db', detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()

@click.command('init-db')
@with_appcontext
def init_db_command():
    db = get_db()
    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))
    click.echo('Database initialized')

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)