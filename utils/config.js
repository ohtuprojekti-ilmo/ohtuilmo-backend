if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let port = process.env.PORT
let dbUrl = process.env.DATABASE_URI

if (process.env.NODE_ENV === 'test') {
  port = process.env.TEST_PORT
  dbUrl = process.env.TEST_DATABASE_URI
}

let login = 'http://opetushallinto.cs.helsinki.fi/login'

let secret = 'secret'

module.exports = {
  dbUrl,
  port,
  login,
  secret
}
