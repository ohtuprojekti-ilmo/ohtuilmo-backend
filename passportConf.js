const LocalStrategy = require('passport-local').Strategy
const User = require('./models/mockUser')

function configure(passport) {
    passport.use(new LocalStrategy(
        async (username, password, cb) => {
            const auth = await User.authenticate(username, password)
            const user = User.findByUsername(username)
            if (auth.error) { 
                //database connection error
                return cb(auth.error)
            }
            if (auth.status === '400') {
                console.log(auth.status)
                //incorrect login 
                return cb(null, false) 
            }
            //user will be undefined if not in database. This will cause passport to return 401, 
            //which is a problem that needs solving still
            return cb(null, user)
        }))


    passport.serializeUser((user, cb) => {
        cb(null, user.id)
    })

    passport.deserializeUser((id, cb) => {
        User.findById(id, (err, user) => {
            if (err) { return cb(err) }
            cb(null, user)
        })
    })
}

module.exports = { configure }