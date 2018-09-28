const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const userModel = require('../models/mockUser')

const getTokenFrom = (request) => {
    const authorization = request.headers.authorization
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

module.exports = (secret) => {
    loginRouter.post('/', async (req, res) => {
        try {
            const response = await userModel.authenticate(req.body.username, req.body.password)
            if (response.data.error) {
                return res.status(401).send({ error: response.data.error })
            }
            const user = response.data
            const token = jwt.sign({ id: user.student_number }, secret)
            res.status(200).send({ token, username: user.username, student_number: user.student_number, first_names: user.first_names, last_name: user.last_name })
        } catch (error) {
            res.status(500).send({ error: error })
        }
    })

    loginRouter.get('/tokenTest', (req, res) => {
        try {
            const token = getTokenFrom(req)
            const decodedToken = jwt.verify(token, secret)
            console.log(token)
            console.log(decodedToken)

            if (!token || !decodedToken.id) {
                return res.status(401).send({ error: "token missing or invalid" })
            }

            res.status(200).send({ message: "success" })

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                response.status(401).json({ error: error.message })
            } else {
                response.status(500).json({ error: error })
            }
        }
    })
    return loginRouter
}
