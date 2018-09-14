const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const pg = require('pg');
const config = require('./utils/config')


// Middleware
app.use(cors())
app.use(bodyParser.json())


// Routers
const examplesRouter = require('./controllers/examples')
app.use('/api/examples', examplesRouter)


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
