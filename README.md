# Tastespuds Platform

Contains the API server and database for the Tastespuds app.

## Setup

First of all, you need to have the required environment variables set, specified in the `docker-compose.yml`.

When you're done with that, run this:

`./dev.sh up -d --build`

You should be good to go!

## Testing

```
# Usage:
./dev.sh exec api yarn test
```

## Database Migration

If you ever want to try your new migration files against the existing container, try this:

```
# Usage:
./dev.sh exec db ./migrate.sh
```
