const LocalStrategy = require('passport-local').Strategy
const User = require('./models/mockUser')

function configure(passport) {
    passport.use(new LocalStrategy(
        async (username, password, cb) => {
            var auth
            try {
                auth = await User.authenticate(username, password)
            } catch (error) {
                return cb(error)
            }
            if (auth.data.error) {
                return cb(null, false, { message: "Incorrect credentials" })
            }
            const user = User.findByUsername(username)
            if(!user) {
                return cb(null, false, { message: "User not in db" })
            }
            return cb(null, user)
        }))


    passport.serializeUser((user, cb) => {
        cb(null, user.student_number)
    })

    passport.deserializeUser((id, cb) => {
        User.findById(id, (err, user) => {
            if (err) { return cb(err) }
            cb(null, user)
        })
    })
}

module.exports = { configure }