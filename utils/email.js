const config = require('./config')
const nodemailer = require('nodemailer')

function send(options) {
  const transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: config.emailPort,
    secure: config.emailSecure,
    auth: {
      user: config.emailUser,
      pass: config.emailPass
    }
  })

  const mailOptions = {
    from: config.emailSender,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
    }
    console.log('sent')
  })
}

module.exports = {
  send
}