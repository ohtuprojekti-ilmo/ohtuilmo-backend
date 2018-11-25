const membershipRouter = require('express').Router()
const db = require('../models/index')
const checkLogin = require('../utils/middleware/routeChecks').checkLogin

function checkIfValidRole(role) {
  var roles = ['student', 'teacher']
  if (roles.includes(role)) return true
  return false
}

membershipRouter.post('/', checkLogin, (req, res) => {
  if (!req.body.student_number) return res.status(400).json({ error: 'student_number undefined' })
  if (!req.body.id) return res.status(400).json({ error: 'id undefined' })
  if (!req.body.role) return res.status(400).json({ error: 'role undefined' })
  if (!checkIfValidRole(req.body.role)) return res.status(400).json({ error: 'invalid role' })

  db.User.findOne({ where: { student_number: req.body.student_number } })
    .then(user => {
      if (!user) return res.status(400).json({ error: 'user not found' })

      db.Group.findById(req.body.id)
        .then(group => {
          if (!group) return res.status(400).json({ error: 'group not found' })

          db.Membership.findOne({
            where: {
              student_number: req.body.student_number,
              id: req.body.id
            }
          })
            .then(membership => {
              if (membership) return res.status(400).json({ error: 'user is already in that group' })

              db.Membership.create({
                id: req.body.id,
                student_number: req.body.student_number,
                role: req.body.role
              })
                .then(membership => {
                  return res.status(200).json({ membership })
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
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

module.exports = membershipRouter