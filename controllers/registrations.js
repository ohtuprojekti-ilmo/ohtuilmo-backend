const registrationsRouter = require('express').Router()
const db = require('../models/index')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const checkLogin = require('../utils/middleware/routeChecks').checkLogin
const checkAdmin = require('../utils/middleware/routeChecks').checkAdmin
const getTokenFrom = require('../utils/middleware/routeChecks').getTokenFrom

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

registrationsRouter.post('/', checkLogin, (req, res) => {
  if (!req.body.questions) return res.status(400).json({ error: 'questions missing' })
  if (!req.body.preferred_topics) return res.status(400).json({ error: 'preferred_topics missing' })
  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, config.secret)
  const loggedInUserStudentNumber = decodedToken.id

  db.User.findOne({ where: { student_number: loggedInUserStudentNumber } })
    .then(user => {
      if (!user) return res.status(400).json({ error: 'student not found' })

      db.Configuration.findOne({ where: { active: true } })
        .then(config => {
          if (!config) return res.status(400).json({ error: 'no active configuration found' })
          db.Registration.findAll({ where: { configuration_id: config.id } })
            .then(registrations => {
              const existingRegistration = registrations.find(e => e.student_number === loggedInUserStudentNumber)
              if (existingRegistration) return res.status(400).json({ error: 'student already registered' })
              db.Registration.create({
                student_number: loggedInUserStudentNumber,
                preferred_topics: req.body.preferred_topics,
                questions: req.body.questions,
                configuration_id: config.id
              })
                .then(registration => {
                  res.status(200).json({ registration })
                })
                .catch(error => handleDatabaseError(res, error))
            })
        })
        .catch(error => handleDatabaseError(res, error))
    })
    .catch(error => handleDatabaseError(res, error))
})

registrationsRouter.get('/current', checkAdmin, (req, res) => {
  db.Configuration.findOne({ where: { active: true } })
    .then(config => {
      if (!config) return res.status(400).json({ error: 'no active configuration found' })

      config.getRegistrations()
        .then(registrations => {
          res.status(200).json({ registrations })
        })
        .catch(error => handleDatabaseError(res, error))
    })
    .catch(error => handleDatabaseError(res, error))
})

module.exports = registrationsRouter