const tokenCheckRouter = require('express').Router()
const checkLogin = require('../utils/middleware/routeChecks').checkLogin
const checkAdmin = require('../utils/middleware/routeChecks').checkAdmin

tokenCheckRouter.get('/login', checkLogin, (req, res) => {
  res.status(200).json({ message: 'success' })
})

tokenCheckRouter.get('/admin', checkAdmin, (req, res) => {
  res.status(200).json({ message: 'success' })
})

module.exports = tokenCheckRouter