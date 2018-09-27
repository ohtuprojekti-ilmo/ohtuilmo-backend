const axios = require('axios')

var users = [
    {
        "username": "username",
        "student_number": "123",
        "email": "test@email.com"
    },
    {
        "username": "username2",
        "student_number": "456",
        "email": "test2@email.com"
    },
    {
        "username": "testertester",
        "student_number": "012345678",
        "first_names": "Timo *Teppo Tellervo",
        "last_name": "Testaaja"
    }
]

function findById(id, cb) {
    const user = users.find(user => user.student_number === id)
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
        const response = await axios.post('http://opetushallinto.cs.helsinki.fi/login',
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
        throw error
    }
}

module.exports = {
    findById, findByUsername, authenticate
}