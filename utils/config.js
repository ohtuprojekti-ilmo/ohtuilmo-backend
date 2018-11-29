if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let port = process.env.PORT
let dbUrl = process.env.DATABASE_URI

let login = 'http://opetushallinto.cs.helsinki.fi/login'

let secret = process.env.SECRET

//email config
let email = {
  sender: 'Ohtuilmo Robot <noreply@helsinki.fi>',
  host: 'smtp.helsinki.fi',
  port: 587,
  secure: false,
  replyTo: 'mluukkai@cs.helsinki.fi',
  cc: 'mluukkai@cs.helsinki.fi'
}

module.exports = {
  dbUrl,
  port,
  login,
  secret,
  email
}
