const usersRouter = require('express').Router()
const db = require('../models/index')
const { checkLogin } = require('../middleware')

usersRouter.put('/:studentNumber', checkLogin, async (req, res) => {
  const { email } = req.body
  const { studentNumber } = req.params

  if (req.user.id !== studentNumber) {
    return res.status(401).json({ error: 'student numbers not matching' })
  }

  if (!email) {
    return res.status(400).json({ error: 'missing email' })
  }

  try {
    const user = await db.User.findOne({
      where: { student_number: studentNumber }
    })
    if (!user) {
      return res.status(400).json({ error: 'user does not exist' })
    }

    const updatedUser = await user.update({ email })
    const refreshedUser = await updatedUser.reload()
    res.status(200).json({ refreshedUser })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'database error' })
  }
})

module.exports = usersRouter
