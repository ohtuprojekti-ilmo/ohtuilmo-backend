[![Build Status](https://travis-ci.org/ohtuprojekti-ilmo/ohtuilmo-backend.svg?branch=master)](https://travis-ci.org/ohtuprojekti-ilmo/ohtuilmo-backend)

## Installation
Clone and run:
`npm install`

## Instructions
Create .env files and add following lines:

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
