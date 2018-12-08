const registrationsRouter = require('express').Router()
const db = require('../models/index')
const checkLogin = require('../utils/middleware/routeChecks').checkLogin

registrationsRouter.post('/', checkLogin, (req, res) => {
  if (!req.body.student_number) return res.status(400).json({ error: 'student number is undefined' })
  if (!req.body.content) return res.status(400).json({ error: 'content missing' })
  db.User.findOne({ where: { student_number: req.body.student_number } })
    .then(user => {
      if (!user) return res.status(400).json({ error: 'student not found' })

      db.Registration.findOne({ where: { student_number: req.body.student_number } })
        .then((foundRegistration) => {
          if (foundRegistration) return res.status(400).json({ error: 'student is already registered' })

          db.Registration.create({
            student_number: req.body.student_number,
            content: req.body.content
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
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

module.exports = registrationsRouter