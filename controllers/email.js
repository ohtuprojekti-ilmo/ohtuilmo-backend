const emailRouter = require('express').Router()
const nodemailer = require('nodemailer')
const db = require('../models/index')
const config = require('../config/').email
const { checkAdmin } = require('../middleware')

const sendSecretLink = (secretId, address) => {
  const options = {
    to: address,
    subject: '[Software engineering project] Project proposal confirmation',
    html: `Thank you for the project proposal. You can use the below link to view or edit your proposal. \n <a href="http://studies.cs.helsinki.fi/projekti/topics/${secretId}">Edit your submission</a>`
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

  if (process.env.NODE_ENV === 'production') {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      } else {
        console.log('sent: ', info)
      }
    })
  }
}

emailRouter.post('/send', checkAdmin, (req, res) => {
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

const defaultEmailTemplates = {
  topic_accepted_fin: '',
  topic_rejected_fin: '',
  topic_accepted_eng: '',
  topic_rejected_eng: ''
}

const serializeTemplatesByLanguage = ({
  topic_accepted_fin,
  topic_rejected_fin,
  topic_accepted_eng,
  topic_rejected_eng
}) => ({
  topicAccepted: {
    finnish: topic_accepted_fin,
    english: topic_accepted_eng
  },
  topicRejected: {
    finnish: topic_rejected_fin,
    english: topic_rejected_eng
  }
})

const deserializeTemplatesByLanguage = ({ topicAccepted, topicRejected }) => ({
  topic_accepted_fin: topicAccepted.finnish,
  topic_rejected_fin: topicRejected.finnish,
  topic_accepted_eng: topicAccepted.english,
  topic_rejected_eng: topicRejected.english
})

emailRouter.get('/templates', checkAdmin, async (req, res) => {
  try {
    const templates = await db.EmailTemplate.findAll({
      limit: 1,
      order: [['created_at', 'DESC']]
    })

    const payload = templates.length > 0 ? templates[0] : defaultEmailTemplates
    return res.json(serializeTemplatesByLanguage(payload))
  } catch (err) {
    res.status(500).json({ error: 'database error' })
  }
})

const isNil = (value) => value === undefined || value === null

const validateTemplates = (body) => {
  if (!body) {
    return 'All attributes must be defined'
  }

  const { topicAccepted, topicRejected } = body
  // allow empty strings!
  if (
    isNil(topicAccepted) ||
    isNil(topicRejected) ||
    isNil(topicAccepted.finnish) ||
    isNil(topicAccepted.english) ||
    isNil(topicRejected.finnish) ||
    isNil(topicRejected.english)
  ) {
    return 'All attributes must be defined'
  }

  return null
}

const validateAndParseTemplates = (req, res, next) => {
  try {
    const validationError = validateTemplates(req.body)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    const deserialized = deserializeTemplatesByLanguage(req.body)
    req.locals = {
      ...req.locals,
      templates: deserialized
    }
    next()
  } catch (e) {
    res.status(500).json({ error: 'internal server error' })
  }
}

emailRouter.post(
  '/templates',
  checkAdmin,
  validateAndParseTemplates,
  async (req, res) => {
    const {
      topic_accepted_fin,
      topic_rejected_fin,
      topic_accepted_eng,
      topic_rejected_eng
    } = req.locals.templates

    try {
      const createdTemplates = await db.EmailTemplate.create({
        topic_accepted_fin,
        topic_rejected_fin,
        topic_accepted_eng,
        topic_rejected_eng
      })
      res.status(200).json(serializeTemplatesByLanguage(createdTemplates))
    } catch (e) {
      res.status(500).json({ error: 'database error' })
    }
  }
)

module.exports = {
  emailRouter,
  sendSecretLink
}
