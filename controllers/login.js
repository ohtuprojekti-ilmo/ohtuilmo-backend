const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const axios = require('axios')
const db = require('../models/index')

async function authenticate(username, password) {
  try {
    const response = await axios.post(config.login,
      {
        'username': username,
        'password': password
      }
    )
    return response
  } catch (error) {
    throw error
  }
}

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

loginRouter.post('/', async (req, res) => {

  if (!req.body.username || !req.body.password) {
    //username or password field undefined
    return res.status(400).json({ error: 'missing username or password' })
  }
  let response
  try {
    response = await authenticate(req.body.username, req.body.password)
  } catch (error) {
    //error from auth server
    console.log(error)
    return res.status(500).json({ error: 'authentication error' })
  }
  if (response.data.error) {
    //incorrect credentials response from auth server
    return res.status(401).json({ error: 'incorrect credentials' })
  }
  const authenticatedUser = response.data
  db.User
    .findOne({ where: { student_number: authenticatedUser.student_number } })
    .then(foundUser => {
      if (foundUser) {
        //user already in database, no need to add
        const token = jwt.sign({ id: foundUser.student_number, admin: foundUser.admin }, config.secret)
        return res.status(200).json({
          token,
          user: foundUser
        })
      } else {
        //user not in database, add user
        db.User
          .create({
            username: authenticatedUser.username,
            student_number: authenticatedUser.student_number,
            first_names: authenticatedUser.first_names,
            last_name: authenticatedUser.last_name,
            email: null,
            admin: false
          })
          .then(savedUser => {
            const token = jwt.sign({ id: savedUser.student_number, admin: savedUser.admin }, config.secret)
            return res.status(200).json({
              token,
              user: savedUser
            })
          })
          .catch(error => handleDatabaseError(res, error))
      }
    })
    .catch(error => handleDatabaseError(res, error))
})

module.exports = loginRouter
