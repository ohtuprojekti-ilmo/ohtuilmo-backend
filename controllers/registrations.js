const registrationsRouter = require('express').Router()
const db = require('../models/index')
const config = require('../config/')
const jwt = require('jsonwebtoken')
const checkLogin = require('../utils/middleware/routeChecks').checkLogin
const checkAdmin = require('../utils/middleware/routeChecks').checkAdmin
const getTokenFrom = require('../utils/middleware/routeChecks').getTokenFrom

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

registrationsRouter.post('/', checkLogin, (req, res) => {
  if (!req.body.questions)
    return res.status(400).json({ error: 'questions missing' })
  if (!req.body.preferred_topics)
    return res.status(400).json({ error: 'preferred_topics missing' })
  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, config.secret)
  const loggedInUserStudentNumber = decodedToken.id

  db.RegistrationManagement.findOne({ order: [['createdAt', 'DESC']] })
    .then((registration_management) => {
      if (!registration_management.project_registration_open) {
        return res
          .status(400)
          .json({ error: 'project registration is not currently open' })
      }

      db.User.findOne({ where: { student_number: loggedInUserStudentNumber } })
        .then((user) => {
          if (!user) return res.status(400).json({ error: 'student not found' })

          db.Configuration.findOne({ where: { active: true } })
            .then((config) => {
              if (!config)
                return res
                  .status(400)
                  .json({ error: 'no active configuration found' })
              db.Registration.findAll({
                where: { configuration_id: config.id }
              }).then((registrations) => {
                const existingRegistration = registrations.find(
                  (e) => e.studentStudentNumber === loggedInUserStudentNumber
                )
                if (existingRegistration)
                  return res
                    .status(400)
                    .json({ error: 'student already registered' })
                db.Registration.create({
                  preferred_topics: req.body.preferred_topics,
                  questions: req.body.questions,
                  configuration_id: config.id
                })
                  .then(async (registration) => {
                    try {
                      await registration.setStudent(loggedInUserStudentNumber)
                    } catch (error) {
                      handleDatabaseError(res, error)
                    }
                    res.status(200).json({ registration })
                  })
                  .catch((error) => handleDatabaseError(res, error))
              })
            })
            .catch((error) => handleDatabaseError(res, error))
        })
        .catch((error) => handleDatabaseError(res, error))
    })
    .catch((error) => handleDatabaseError(res, error))
})

registrationsRouter.get('/current', checkAdmin, (req, res) => {
  const formatJson = (registration) => {
    registration.preferred_topics.forEach((topic) => {
      delete topic.content.description
      delete topic.content.environment
      delete topic.content.additionalInfo
      delete topic.content.specialRequests
      delete topic.createdAt
      delete topic.updatedAt
    })

    return {
      student_number: registration.studentStudentNumber,
      last_name: registration.student.last_name,
      first_names: registration.student.first_names,
      email: registration.student.email,
      preferred_topics: registration.preferred_topics,
      questions: registration.questions
    }
  }

  db.Configuration.findOne({ where: { active: true } })
    .then((config) => {
      if (!config)
        return res.status(400).json({ error: 'no active configuration found' })

      db.Registration.findAll({
        where: { configuration_id: config.id },
        include: ['student']
      })
        .then((registrations) => {
          res.status(200).json({
            registrationCount: registrations.length,
            registrations: registrations.map(formatJson)
          })
        })
        .catch((error) => handleDatabaseError(res, error))
      // config.getRegistrations()
      //   .then(registrations => {
      //     res.status(200).json({ registrations })
      //   })
      //   .catch(error => handleDatabaseError(res, error))
    })
    .catch((error) => handleDatabaseError(res, error))
})

module.exports = registrationsRouter
