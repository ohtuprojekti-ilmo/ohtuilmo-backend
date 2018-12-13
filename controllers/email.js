const emailRouter = require('express').Router()
const nodemailer = require('nodemailer')
const config = require('../utils/config').email

const sendSecretLink = (secretId, address) => {
  const options = {
    to: address,
    subject: '[Software engineering project] project proposal',
    html:
      'Thank you for the project proposal. You can use the below link to view or edit your proposal. \n \
          <a href="http://studies.cs.helsinki.fi/projekti/topics/' + secretId + '">Edit your submission</a>'
  }
  send(options)
}

const sendAcceptEng = (address) => {
  const options = {
    to: address,
    subject: config.acceptEng.subject,
    html: config.acceptEng.html
  }
  send(options)
}

const sendRejectEng = (address) => {
  const options = {
    to: address,
    subject: config.rejectEng.subject,
    html: config.rejectEng.html
  }
  send(options)
}

const sendAcceptFin = (address) => {
  const options = {
    to: address,
    subject: config.acceptFin.subject,
    html: config.acceptFin.html
  }
  send(options)
}

const sendRejectFin = (address) => {
  const options = {
    to: address,
    subject: config.rejectFin.subject,
    html: config.rejectFin.html
  }
  send(options)
}

const send = (options) => {
  const transporter = nodemailer.createTransport({
    host: config.general.host,
    port: config.general.port,
    secure: config.general.secure
  })

  const mailOptions = {
    from: config.general.sender,
    to: options.to,
    replyTo: config.general.replyTo,
    cc: config.general.cc,
    subject: options.subject,
    text: options.text,
    html: options.html
  }

  if (process.env.NODE_ENV === 'PRODUCTION') {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      } else {
        console.log('sent: ', info)
      }
    })
  }
}

emailRouter.post('/send', (req, res) => {

  switch (req.body.messageType) {
  case 'acceptEng':
    sendAcceptEng(req.body.address)
    res.status(200).json({ message: 'sending email' })
    break
  case 'rejectEng':
    sendRejectEng(req.body.address)
    res.status(200).json({ message: 'sending email' })
    break
  case 'acceptFin':
    sendAcceptFin(req.body.address)
    res.status(200).json({ message: 'sending email' })
    break
  case 'rejectFin':
    sendRejectFin(req.body.address)
    res.status(200).json({ message: 'sending email' })
    break
  default:
    res.status(401).json({ error: 'unknown message type requested ' })
    break
  }
})

module.exports = {
  emailRouter, sendSecretLink
}
