const emailRouter = require('express').Router()
const nodemailer = require('nodemailer')
const db = require('../models/index')
const emailConfig = require('../config/').email
const { checkAdmin } = require('../middleware')

const sendSecretLink = (secretId, address) => {
  const options = {
    to: address,
    subject: emailConfig.subjects.secretLink,
    html: `Thank you for the project proposal. You can use the below link to view or edit your proposal. \n <a href="http://studies.cs.helsinki.fi/projekti/topics/${secretId}">Edit your submission</a>`
  }
  send(options)
}

const send = (to, subject, html, text) => {
  const transporter = nodemailer.createTransport({
    host: emailConfig.general.host,
    port: emailConfig.general.port,
    secure: emailConfig.general.secure
  })

  const mailOptions = {
    from: emailConfig.general.sender,
    to: to,
    replyTo: emailConfig.general.replyTo,
    cc: emailConfig.general.cc,
    subject: subject,
    text: text,
    html: html
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

const validateBody = (body) => {
  if (!body) {
    return 'All attributes must be defined'
  }

  if (!body.address) {
    return 'address is required'
  }

  if (!body.messageType) {
    return 'messageType is required'
  }

  if (
    body.messageType !== 'topicAccepted' &&
    body.messageType !== 'topicRejected'
  ) {
    return 'invalid messageType'
  }

  if (
    body.messageLanguage !== 'finnish' &&
    body.messageLanguage !== 'english'
  ) {
    return 'invalid messageLanguage'
  }

  if (!body.templateContext || !body.templateContext.topicName) {
    return 'topicName required in templateContext'
  }

  return null
}

const validateSendBody = async (req, res, next) => {
  const validationError = validateBody(req.body)
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  next()
}

const msgTypeToDbColumnMapping = {
  topicAccepted: {
    finnish: 'topic_accepted_fin',
    english: 'topic_accepted_eng'
  },
  topicRejected: {
    finnish: 'topic_rejected_fin',
    english: 'topic_rejected_eng'
  }
}

emailRouter.post('/send', checkAdmin, validateSendBody, async (req, res) => {
  const templates = await db.EmailTemplate.findOne({
    order: [['created_at', 'DESC']]
  })

  if (!templates) {
    return res
      .status(400)
      .json({ error: 'email templates have not been configured' })
  }

  const { address, messageType, messageLanguage, templateContext } = req.body

  const dbTemplateName = msgTypeToDbColumnMapping[messageType][messageLanguage]

  const renderedEmail = templates.render(dbTemplateName, templateContext)
  const subject = emailConfig.subjects[messageType][messageLanguage]

  send(address, subject, null, renderedEmail)
  res.status(200).end()
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
