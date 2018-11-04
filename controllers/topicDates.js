const topicDatesRouter = require('express').Router()
const db = require('../models/index')
const checkAdmin = require('../utils/middleware/checkAdmin').checkAdmin

topicDatesRouter.post('/', checkAdmin, (req, res) => {
  if (!req.body.dates) return res.status(400).json({ error: 'dates undefined' })
  db.TopicDate.create({
    dates: req.body.dates
  })
    .then(topicDate => {
      res.status(200).json({ topicDate })
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

//fetches latest entry
topicDatesRouter.get('/', checkAdmin, (req, res) => {
  db.TopicDate.findAll({
    limit: 1,
    order: [['createdAt', 'DESC']]
  })
    .then(topicDate => {
      res.status(200).json({ topicDate })
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

module.exports = topicDatesRouter