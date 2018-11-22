if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let port = process.env.PORT
let dbUrl = process.env.DATABASE_URI

let login = 'http://opetushallinto.cs.helsinki.fi/login'

let secret = 'secret'

//email config
let email = {
  sender: 'Ohtuilmo Robot <noreply@helsinki.fi>',
  host: 'smtp.helsinki.fi',
  port: 587,
  secure: false
}
let allowSendEmail = false
if (process.env.NODE_ENV === 'production') {
  allowSendEmail = true
}

module.exports = {
  dbUrl,
  port,
  login,
  secret,
  email,
  allowSendEmail
}
