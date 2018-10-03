const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const axios = require('axios')

const getTokenFrom = (request) => {
    const authorization = request.headers.authorization
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

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


loginRouter.post('/', async (req, res) => {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ error: 'missing username or password' })
    }
    try {
        const response = await authenticate(req.body.username, req.body.password)
        if (response.data.error) {
            return res.status(401).json({ error: 'incorrect credentials' })
        }
        const user = response.data
        const token = jwt.sign({ id: user.student_number }, config.secret)
        res.status(200).json({ token, username: user.username, student_number: user.student_number, first_names: user.first_names, last_name: user.last_name })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'something went wrong' })
    }
})

loginRouter.get('/tokenTest', (req, res) => {
    try {
        const token = getTokenFrom(req)
        const decodedToken = jwt.verify(token, config.secret)

        if (!token || !decodedToken.id) {
            return res.status(401).json({ error: 'token missing or invalid' })
        }

        res.status(200).json({ message: 'success' })

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ error: error.message })
        } else {
            res.status(500).json({ error: error })
        }
    }
})

module.exports = loginRouter
