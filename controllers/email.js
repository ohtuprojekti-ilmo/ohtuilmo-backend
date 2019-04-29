const util = require('util')
const emailRouter = require('express').Router()
const nodemailer = require('nodemailer')
const db = require('../models/index')
const emailConfig = require('../config/').email
const { checkAdmin } = require('../middleware')
const { emailTypeToTemplateName } = require('../utils')

const sendSecretLink = (secretId, address) => {
  const html = `Thank you for the project proposal. You can use the below link to view or edit your proposal. <br /> <a href="http://studies.cs.helsinki.fi/projekti/topics/${secretId}">Edit your submission</a>`
  send(address, emailConfig.subjects.secretLink, html)
}

const send = async (to, subject, html, text) => {
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

  if (!emailConfig.isEnabled) {
    console.log('Email not enabled with EMAIL_ENABLED=true, skipping mail')
    return
  }

  const sendMailAsync = util.promisify(transporter.sendMail.bind(transporter))

  try {
    const info = await sendMailAsync(mailOptions)

    if (info.rejected.length > 0) {
      const rejectedEmails = info.rejected.join(', ')
      const error = new Error(
        `SMTP server rejected the following recipients: ${rejectedEmails}`
      )
      console.error(info)
      throw error
    }

    console.log('email sent', info)
  } catch (error) {
    console.error(error)
    throw error
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

  const dbTemplateName = emailTypeToTemplateName(messageType, messageLanguage)

  const renderedEmail = templates.render(dbTemplateName, templateContext)
  const subject = emailConfig.subjects[messageType][messageLanguage]

  try {
    await send(address, subject, null, renderedEmail)
    const createdModel = await db.SentTopicEmail.create({
      topic_id: templateContext.topicId, // trust the admin that the topic id is valid :)
      email_template_name: dbTemplateName
    })
    res.status(200).json(db.SentTopicEmail.format(createdModel))
  } catch (e) {
    res.status(500).json({ error: e.message, details: e })
  }
})

emailRouter.delete('/sent-emails', checkAdmin, async (req, res) => {
  await db.SentTopicEmail.destroy({ where: {} })
  res.status(204).end()
})

const defaultEmailTemplates = {
  topic_accepted_fin: '',
  topic_rejected_fin: '',
  topic_accepted_eng: '',
  topic_rejected_eng: '',
  customer_review_link_fin: '',
  customer_review_link_eng: ''
}

const serializeTemplatesByLanguage = ({
  topic_accepted_fin,
  topic_rejected_fin,
  topic_accepted_eng,
  topic_rejected_eng,
  customer_review_link_fin,
  customer_review_link_eng
}) => ({
  topicAccepted: {
    finnish: topic_accepted_fin,
    english: topic_accepted_eng
  },
  topicRejected: {
    finnish: topic_rejected_fin,
    english: topic_rejected_eng
  },
  customerReviewLink: {
    finnish: customer_review_link_fin,
    english: customer_review_link_eng
  }
})

const deserializeTemplatesByLanguage = ({
  topicAccepted,
  topicRejected,
  customerReviewLink
}) => ({
  topic_accepted_fin: topicAccepted.finnish,
  topic_rejected_fin: topicRejected.finnish,
  topic_accepted_eng: topicAccepted.english,
  topic_rejected_eng: topicRejected.english,
  customer_review_link_fin: customerReviewLink.finnish,
  customer_review_link_eng: customerReviewLink.english
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

  const { topicAccepted, topicRejected, customerReviewLink } = body
  // allow empty strings!
  if (
    isNil(topicAccepted) ||
    isNil(topicRejected) ||
    isNil(topicAccepted.finnish) ||
    isNil(topicAccepted.english) ||
    isNil(topicRejected.finnish) ||
    isNil(topicRejected.english) ||
    isNil(customerReviewLink.finnish) ||
    isNil(customerReviewLink.english)
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
      customer_review_link_fin,
      topic_accepted_eng,
      topic_rejected_eng,
      customer_review_link_eng
    } = req.locals.templates

    try {
      const createdTemplates = await db.EmailTemplate.create({
        topic_accepted_fin,
        topic_rejected_fin,
        customer_review_link_fin,
        topic_accepted_eng,
        topic_rejected_eng,
        customer_review_link_eng
      })
      res.status(200).json(serializeTemplatesByLanguage(createdTemplates))
    } catch (e) {
      res.status(500).json({ error: 'database error' })
    }
  }
)

emailRouter.delete('/templates', checkAdmin, async (req, res) => {
  await db.EmailTemplate.destroy({ where: {} })
  res.status(204).end()
})

module.exports = {
  emailRouter,
  sendSecretLink
}
