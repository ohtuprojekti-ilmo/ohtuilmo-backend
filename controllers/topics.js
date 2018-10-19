const topicsRouter = require('express').Router()
const db = require('../models/index')

topicsRouter.post('/', (req, res) => {
  if (!req.body.content) return res.status(400).json({ error: 'content undefined' })
  db.Topic.create({
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

topicsRouter.get('/', async (req, res) => {
  try {
    db.Topic.findAll({}).then(topics => {
      if (topics) {
        return res.status(200).json(topics)
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'database error' })
  }
})

module.exports = topicsRouter