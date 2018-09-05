FROM postgres:10.1-alpine

WORKDIR /db

COPY . .
COPY scripts /docker-entrypoint-initdb.d
COPY migrate.sh /docker-entrypoint-initdb.d/100-migrate.sh
