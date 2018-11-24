if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let port = process.env.PORT
let dbUrl = process.env.DATABASE_URI

let login = 'https://opetushallinto.cs.helsinki.fi/login'

let secret = process.env.SECRET

//email config
let email = {
  sender: 'Ohtuilmo Robot <noreply@helsinki.fi>',
  host: 'smtp.helsinki.fi',
  port: 587,
  secure: false
}

module.exports = {
  dbUrl,
  port,
  login,
  secret,
  email
}
