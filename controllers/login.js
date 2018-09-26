const loginRouter = require('express').Router()
const passport = require('passport')

module.exports = function (passport, path) {

    loginRouter.get('/okTest', (req, res) => {
        if (req.isAuthenticated()) {
            console.log('success')
            console.log(req.user.username)
            res.status(200).send()
        } else {
            res.redirect(`${path}/failTest`)
        }
    })

    loginRouter.get('/failTest', (req, res) => {
        console.log('failure')
        res.status(401).send()
    })

    loginRouter.post('/', passport.authenticate('local',
        {
            successRedirect: `${path}/okTest`,
            failureRedirect: `${path}/failTest`
        }
    ))
    loginRouter.get('/sessionTest', passport.authenticate('local',
        {
            successRedirect: `${path}/okTest`,
            failureRedirect: `${path}/failTest`
        }
    ))

    return loginRouter
}
