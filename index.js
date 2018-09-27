const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const logger = require('./utils/middleware/logger')
const cors = require('cors')
const pg = require('pg');
const config = require('./utils/config')
const session = require('express-session')
const flash = require('connect-flash')

//passport init
const passport = require('passport')
const passportConf = require('./passportConf')
passportConf.configure(passport)

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(logger)
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


// Routers
const examplesRouter = require('./controllers/examples')
const loginRouter = require('./controllers/login')(passport, '/api/login')
app.use('/api/examples', examplesRouter)
app.use('/api/login', loginRouter)


// Database connection
// const connectionString = process.env.DATABASE_URI || 'postgres://localhost:5432/todo';
// const client = new pg.Client(connectionString)
// client.connect();

// Initialize server
const PORT = config.port
const server = http.createServer(app)
server.listen(PORT, () => {
  console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
  // Close database connection
  client.end()
    .then(() => console.log('client has disconnected'))
    .catch(() => console.error('error during disconnection', err.stack))
})

module.exports = {
  app, server
}
