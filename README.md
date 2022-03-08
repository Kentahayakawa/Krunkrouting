# KrunkRouting

## About

Helps you find bars and coordinate your night out with friends.

## Running

See the README files in `/flask-api` and `/krunkrouting`. The gist is that you need to cd into both directories and then run `docker-compose up --build`. Then the two web servers should be available on localhost via ports `3000` and `5000` respectively.

## Testing

We have a build script described in `.github/workflows/main.yml` that automatically gets invoked on pushes and pull requests. You can also run it manually via GitHub actions.