# Tastespuds Platform

Contains the API server and database for the Tastespuds app.

## Setup

First of all, you need to have the required environment variables set, specified in the `docker-compose.yml`.

When you're done with that, run this:

`./scripts/dev.sh up -d --build`

You should be good to go!

## Teardown

When something seems fishy, bomb it:

`./scripts/dev.sh down --rmi all`

## Testing

```
# Usage:
./scripts/dev.sh exec api npm test
```

## Database Migration

If you ever want to try your new migration files against the existing container, try this:

```
# Usage:
./scripts/dev.sh exec api ./scripts/migrate.sh
```
