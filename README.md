[![Build Status](https://travis-ci.org/ohtuprojekti-ilmo/ohtuilmo-backend.svg?branch=master)](https://travis-ci.org/ohtuprojekti-ilmo/ohtuilmo-backend)

## Installation
Clone and run:
`npm install`

## Instructions
[How to start frontend, backend and database using docker-compose](https://github.com/ohtuprojekti-ilmo/ohtuilmo-frontend/wiki)

## Deploying to production

Travis automatically builds a new Docker image when new commits are pushed to master. This image is then pushed to DockerHub under [`ohtuprojektiilmo/ohtuback`](https://hub.docker.com/r/ohtuprojektiilmo/ohtuback).

See below for Docker Compose production deployment instructions.

### When there are no schema changes

If the models have not changed and there are no migrations to be run, just pull the latest container and restart.

```
docker-compose pull backend
docker-compose stop backend
docker-compose up -d backend
```

### When there are schema changes and migrations to be run

If there are new migrations to be run, run the migrations before restarting the container.

```
docker-compose pull backend
docker-compose stop backend
docker-compose run --entrypoint 'npm run db:migrate' backend
docker-compose up -d backend
```

## More docker instructions

[Docker cheatsheet](https://github.com/jexniemi/Docker-cheat-page/wiki)
