const tokenCheckRouter = require('express').Router()
const checkLogin = require('../utils/middleware/checkLogin').checkLogin
const checkAdmin = require('../utils/middleware/checkAdmin').checkAdmin

tokenCheckRouter.get('/login', checkLogin, (req, res) => {
  res.status(200).send()
})

tokenCheckRouter.get('/admin', checkAdmin, (req, res) => {
  res.status(200).send()
})

module.exports = tokenCheckRouter