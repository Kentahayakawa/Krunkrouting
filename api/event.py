from db import get_db

class Event():
    def __init__(self, id, name, time):
        self.id = id
        self.name = name
        self.time = time

    @staticmethod
    def get(event_id):
        db = get_db()
        event = db.execute(
            'SELECT * FROM event WHERE id = ?', (event_id,)
        ).fetchone()
        if not event:
            return None

        event = Event(
            id = event[0],
            name = event[1],
            time = event[2]
        )
        return event

    @staticmethod
    def create(id, name, time):
        db = get_db()
        db.execute(
            'INSERT INTO event (id, name, time) VALUES (?, ?, ?, ?)',
            (id, name, time)
        )
        db.commit()
