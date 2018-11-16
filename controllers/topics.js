const topicsRouter = require('express').Router()
const db = require('../models/index')
const checkAdmin = require('../utils/middleware/checkAdmin').checkAdmin
const email = require('../utils/email')

topicsRouter.post('/', (req, res) => {
  if (!req.body.content) return res.status(400).json({ error: 'content undefined' })
  db.Topic.create({
    content: req.body.content
  })
    .then(topic => {
      const options = {
        to: 'antti.j.kataja@gmail.com',
        subject: 'asdf',
        text: 'moi',
        html: ''
      }
      email.send(options)
      res.status(200).json({ topic })
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

topicsRouter.put('/:id', checkAdmin, (req, res) => {
  db.Topic.findById(req.params.id)
    .then(topic => {
      if (!topic) return res.status(400).json({ error: 'no topic with that id' })
      topic.update({
        active: req.body.active,
        content: req.body.content
      })
        .then(topic => {
          topic.reload().then(topic => {
            res.status(200).json({ topic })
          })
        })
        .catch(error => {
          console.log(error)
          res.status(500).json({ error: 'database error' })
        })
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

topicsRouter.get('/', (req, res) => {
  db.Topic.findAll({})
    .then(topics => {
      res.status(200).json(topics)
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

topicsRouter.get('/:id', (req, res) => {
  db.Topic.findOne({ where: { topic_id: req.params.id } })
    .then(topic => {
      res.status(200).json(topic)
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

module.exports = topicsRouter