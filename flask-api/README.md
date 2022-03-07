# Flask API Server

## How to run

Make sure you have [Docker](https://www.docker.com/) installed, as well as docker-compose if you're on Linux. Then run `docker up --build` in this directory.

## Making changes

CTRL+C out of Docker and then re-run `docker up --build`. This will re-load the API, and reset the SQL database.

## Testing

There are some tests in `tests.py`, which you can run with `python -m pytest tests.py`, and they also get run automatically whenever you push to origin. Additionally, there is a Postman collection called `KrunkRouting.postman_collection.json`, which you can load into Postman and then test the various API endpoints there.