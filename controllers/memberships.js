const membershipRouter = require('express').Router()
const db = require('../models/index')
const checkLogin = require('../utils/middleware/checkLogin').checkLogin

function checkIfValidRole(role) {
  roles = ['student', 'teacher']
  if (roles.includes(role)) return true
  return false
}

membershipRouter.post('/', checkLogin, (req, res) => {
  if (!req.body.student_number) return res.status(400).json({ error: 'student_number undefined' })
  if (!req.body.group_id) return res.status(400).json({ error: 'group_id undefined' })
  if (!req.body.role) return res.status(400).json({ error: 'role undefined' })
  if (!checkIfValidRole(req.body.role)) return res.status(400).json({ error: 'invalid role' })

  db.User.findOne({ where: { student_number: req.body.student_number } })
    .then(user => {
      if(!user) return res.status(400).json({ error: 'user not found' })

      db.Group.findById(req.body.group_id)
        .then(group => {
          if (!group) return res.status(400).json({ error: 'group not found' })

          db.Membership.create({
            group_id: req.body.group_id,
            student_number: req.body.student_number,
            role: req.body.role
          })
            .then(group => {
              return res.status(200).json({ group })
            })
            .error(error => {
              console.log(error)
              res.status(500).json({ error: 'database error' })
            })
        })
        .error(error => {
          console.log(error)
          res.status(500).json({ error: 'database error' })
        })
    })
    .error(error => {
      console.log(erro)
      res.status(500).json({ error: 'database error' })
    })    
})

module.exports = membershipRouter

