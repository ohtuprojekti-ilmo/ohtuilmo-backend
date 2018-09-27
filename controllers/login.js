const loginRouter = require('express').Router()
const passport = require('passport')

module.exports = function (passport, path) {

    loginRouter.get('/okTest', (req, res) => {
        if (req.isAuthenticated()) {
            console.log('success')
            console.log(req.user.username)
            res.status(200).send(req.user)
        } else {
            res.redirect(`${path}/failTest`)
        }
    })

    loginRouter.get('/failTest', (req, res) => {
        console.log('failure')
        console.log(req.flash('error'))
        res.status(401).send()
    })

    loginRouter.post('/', passport.authenticate('local',
        {
            successRedirect: `${path}/okTest`,
            failureRedirect: `${path}/failTest`,
            failureFlash: true,
            badRequestMessage: 'Missing fields'
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
