const registrationsRouter = require('express').Router()
const db = require('../models/index')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const checkLogin = require('../utils/middleware/routeChecks').checkLogin
const getTokenFrom = require('../utils/middleware/routeChecks').getTokenFrom


registrationsRouter.post('/', checkLogin, (req, res) => {
  if (!req.body.questions) return res.status(400).json({ error: 'questions missing' })
  if (!req.body.preferred_topics) return res.status(400).json({ error: 'preferred_topics missing' })
  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, config.secret)
  const loggedInUserStudentNumber = decodedToken.id

  db.User.findOne({ where: { student_number: loggedInUserStudentNumber } })
    .then(user => {
      if (!user) return res.status(400).json({ error: 'student not found' })

      db.Registration.create({
        student_number: loggedInUserStudentNumber,
        preferred_topics: req.body.preferred_topics,
        questions: req.body.questions
      })
        .then(registration => {
          res.status(200).json({ registration })
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

module.exports = registrationsRouter