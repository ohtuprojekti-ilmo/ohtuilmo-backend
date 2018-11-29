const usersRouter = require('express').Router()
const db = require('../models/index')
const checkValidStudentNumber = require('../utils/middleware/routeChecks').checkValidStudentNumber

usersRouter.put('/:student_number', checkValidStudentNumber, (req, res) => {
  if (!req.body.email) return res.status(400).json({ error: 'missing email' })
  
  db.User.findOne({ where: { student_number: req.params.student_number } })
    .then(user => {
      if (!user) return res.status(400).json({ error: 'user does not exist' })

      user.update({
        email: req.body.email
      })
        .then(user => {
          user.reload().then(user => {
            res.status(200).json({ user })
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

module.exports = usersRouter