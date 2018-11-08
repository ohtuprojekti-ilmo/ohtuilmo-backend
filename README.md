[![Build Status](https://travis-ci.org/ohtuprojekti-ilmo/ohtuilmo-backend.svg?branch=master)](https://travis-ci.org/ohtuprojekti-ilmo/ohtuilmo-backend)

## Installation
Clone and run:
`npm install`

## Instructions
- [How to start frontend, backend and database using docker-compose](https://github.com/ohtuprojekti-ilmo/ohtuilmo-frontend/wiki)

### How to start only backend
Create .env file to the project root and add following lines:

```
DATABASE_URI=TODO
PORT=3001

TEST_PORT=3002
TEST_DATABASE_URI=//
```

Run `npm run watch` to run the project in watch mode

Test get request: http://localhost:3001/api/examples/. Should return { "test": "ok" }

### Docker instructions

[Docker cheatsheet](https://github.com/jexniemi/Docker-cheat-page/wiki)
