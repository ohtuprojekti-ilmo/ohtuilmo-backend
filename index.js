const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const logger = require('./utils/middleware/logger')
const cors = require('cors')
// const pg = require('pg')
const config = require('./utils/config')

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(logger)

// Routers
const examplesRouter = require('./controllers/examples')
const loginRouter = require('./controllers/login')
app.use('/api/examples', examplesRouter)
<<<<<<< HEAD
=======
app.use('/api/login', loginRouter)
>>>>>>> master

// Database connection
// const connectionString = process.env.DATABASE_URI || 'postgres://localhost:5432/todo';
// const client = new pg.Client(connectionString)
// client.connect();

// Database connection
const db = require('./models')
db.connect()

// Initialize server
const PORT = config.port
const server = http.createServer(app)
server.listen(PORT, () => {
  console.log(`Server running on port ${config.port}`)
})

server.on('close', () => {
  // Close database connection
<<<<<<< HEAD
  db.sequelize.close()
    .then(() => console.log('client has disconnected'))
    .catch(() => console.error('error during disconnection', err.stack))
=======
  // client
  //   .end()
  //   .then(() => console.log('client has disconnected'))
  //   .catch(() => console.error('error during disconnection', err.stack))
>>>>>>> master
})

module.exports = {
  app,
  server
}
