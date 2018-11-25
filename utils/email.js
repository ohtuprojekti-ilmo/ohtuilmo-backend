const config = require('./config')
const nodemailer = require('nodemailer')

function sendSecretLink(secretId, address) {
  const options = {
    to: address,
    subject: '[Software engineering project] project proposal',
    html:
      'Thank you for the project proposal. You can use the below link to view or edit your proposal. \n \
          <a href="http://studies.cs.helsinki.fi/projekti/topics/' + secretId + '">Edit your submission</a>'
  }
  send(options)
}

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
    } else {
      console.log('sent: ', info)
    }
  })
}

module.exports = {
  sendSecretLink
}
