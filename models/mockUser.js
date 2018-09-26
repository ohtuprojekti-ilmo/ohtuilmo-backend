const axios = require('axios')

var users = [
    {
        "id": 1,
        "username": "username",
        "email": "test@email.com"
    },
    {
        "id": 2,
        "username": "username2",
        "email": "test2@email.com"
    }
]

function findById(id, cb) {
    const user = users.find(user => user.id === id)
    if (!user) {
        return cb(new Error(`User with id ${id} does not exist`))
    }
    return cb(null, user)
}

function findByUsername(username) {
    const user = users.find(user => user.username === username)
    return user
}

async function authenticate(username, password) {
    try {
        const response = await axios.post('http://localhost:5000/api/login',
            {
                'username': username,
                'password': password
            },
            {
                validateStatus: (status) => status <= 400
            }
        )
        return response
    } catch (error) {
        return { error: error }
    }
}

module.exports = {
    findById, findByUsername, authenticate
}