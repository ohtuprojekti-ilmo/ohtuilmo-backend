if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let port = process.env.PORT
let dbUrl = process.env.DATABASE_URI

let login = 'http://opetushallinto.cs.helsinki.fi/login'

let secret = process.env.SECRET

// default email config
let email = {
  general: {
    sender: 'Ohtuilmo Robot <noreply@helsinki.fi>',
    host: 'smtp.helsinki.fi',
    port: 587,
    secure: false,
    replyTo: 'mluukkai@cs.helsinki.fi',
    cc: 'mluukkai@cs.helsinki.fi'
  },
  acceptEng: {
    subject: 'acceptEng test',
    html: '<h1>test</h1>'
  },
  rejectEng: {
    subject: 'rejectEng test',
    html: '<h1>test</h1>'
  },
  acceptFin: {
    subject: 'acceptFin testi',
    html: '<h1>testi</h1>'
  },
  rejectFin: {
    subject: 'rejectFin testi',
    html: '<h1>testi</h1>'
  }
}

module.exports = {
  dbUrl,
  port,
  login,
  secret,
  email
}
