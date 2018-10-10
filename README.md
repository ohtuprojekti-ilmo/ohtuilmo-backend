[![Build Status](https://travis-ci.org/ohtuprojekti-ilmo/ohtuilmo-backend.svg?branch=master)](https://travis-ci.org/ohtuprojekti-ilmo/ohtuilmo-backend)

## Installation
Clone and run:
`npm install`

## Instructions
Create .env file to the project root and add following lines:

```
DATABASE_URI=TODO
PORT=3001

TEST_PORT=3002
TEST_DATABASE_URI=//
```

Run `npm run watch` to run the project in watch mode

Test get request: http://localhost:3001/api/examples/. Should return { "test": "ok" }

## Docker instructions

[Docker cheatsheet](https://github.com/jexniemi/Docker-cheat-page/wiki)

## Database instructions
- sudo might need to be used with docker commands

- "docker ps" lists all running containers

1. Copy docker-compose.yml from shared Google drive folder
2. Run "docker-compose up" inside the same folder where your docker-compose.yml file is. Now frontend, backend and database containers should be running
3. Open new terminal or use detached mode (docker-compose -d up)
4. "docker exec -it _containername_ /bin/bash" lets you run commands inside a container
5. Run "psql -U postgres" inside container and now you should be able to do sql queries
