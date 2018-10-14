const topicsRouter = require('express').Router()
const db = require('../models/index')
const checkLogin = require('../utils/middleware/checkLogin').checkLogin

topicsRouter.post('/', checkLogin, (req, res) => {
  if (!req.body.content) return res.status(400).json({ error: 'content undefined' })
  if (!req.body.active) return res.status(400).json({ error: '/"active/" undefined' })
  db.Topic.create({
    active: req.body.active,
    content: req.body.content
  })
    .then(topic => {
      res.status(200).json({ topic })
    })
    .error(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

module.exports = topicsRouter