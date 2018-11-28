FROM postgres:10.1-alpine

WORKDIR /db

COPY db/scripts /docker-entrypoint-initdb.d
