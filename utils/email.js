const config = require('./config')
const nodemailer = require('nodemailer')

function send(options) {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure
  })

  const mailOptions = {
    from: config.email.sender,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
    }
    console.log('sent: ', info)
  })
}

module.exports = {
  send
}