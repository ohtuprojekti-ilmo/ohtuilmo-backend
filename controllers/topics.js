const topicsRouter = require('express').Router()
const db = require('../models/index')
const checkAdmin = require('../utils/middleware/checkAdmin').checkAdmin
const email = require('../utils/email')
const getRandomId = require('../utils/idGeneration').getRandomId

function format(topic) {
  let formatted = topic
  formatted.secret_id = ''
  return formatted
}

topicsRouter.post('/', (req, res) => {
  if (!req.body.content) return res.status(400).json({ error: 'content undefined' })
  const secret_id = getRandomId()
  db.Topic.create({
    content: req.body.content,
    acronym: req.body.acronym,
    secret_id
  })
    .then(topic => {
      topic = format(topic)
      email.sendSecretLink(topic.secret_id, topic.email)
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
        content: req.body.content,
        acronym: req.body.acronym
      })
        .then(topic => {
          topic = format(topic)
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

topicsRouter.get('/', checkAdmin, (req, res) => {
  db.Topic.findAll({})
    .then(topics => {
      topics = topics.map(topic => format(topic))
      res.status(200).json(topics)
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

topicsRouter.get('/active', (req, res) => {
  db.Topic.findAll({
    where: {
      active: true
    }
  })
    .then(topics => {
      topics = topics.map(topic => format(topic))
      res.status(200).json(topics)
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

topicsRouter.get('/:id', (req, res) => {
  const id = req.params.id
  //check if normal or 'secret' id
  if (isNaN(id)) {
    db.Topic.findOne({
      where: {
        secret_id: id
      }
    })
      .then(topic => {
        topic = format(topic)
        res.status(200).json(topic)
      })
      .catch(error => {
        console.log(error)
        res.status(500).json({ error: 'database error' })
      })
  } else {
    db.Topic.findOne({
      where: {
        id: id
      }
    })
      .then(topic => {
        topic = format(topic)
        res.status(200).json(topic)
      })
      .catch(error => {
        console.log(error)
        res.status(500).json({ error: 'database error' })
      })
  }
})

module.exports = topicsRouter