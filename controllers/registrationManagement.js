const registrationManagementRouter = require('express').Router()
const db = require('../models/index')
const { checkAdmin } = require('../middleware')

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

const create = async (req, res) => {
  const { registrationManagement } = req.body

  try {
    const createdConfig = await db.RegistrationManagement.create(
      registrationManagement
    )
    return res.status(201).json(createdConfig)
  } catch (err) {
    return handleDatabaseError(res, err)
  }
}

const isNil = (value) => value === undefined || value === null

const validateRegistrationManagement = (registrationManagement) => {
  if (!registrationManagement) {
    return 'All attributes must be defined'
  }

  const {
    project_registration_open,
    project_registration_message,
    project_registration_info,
    topic_registration_open,
    topic_registration_message
  } = registrationManagement

  if (
    isNil(project_registration_open) ||
    isNil(project_registration_message) ||
    isNil(project_registration_info) ||
    isNil(topic_registration_open) ||
    isNil(topic_registration_message)
  ) {
    return 'All attributes must be defined'
  }

  if (!project_registration_open && project_registration_message.length === 0) {
    return 'Message must be provided when project registration is closed'
  }

  if (!topic_registration_open && topic_registration_message.length === 0) {
    return 'Message must be provided when topic registration is closed'
  }

  return null
}

registrationManagementRouter.post('/', checkAdmin, async (req, res) => {
  const { registrationManagement } = req.body

  const error = validateRegistrationManagement(registrationManagement)
  if (error) {
    return res.status(400).json({ error })
  }

  create(req, res)
})

registrationManagementRouter.get('/', async (req, res) => {
  try {
    const entry = await db.RegistrationManagement.findOne({
      order: [['createdAt', 'DESC']]
    })

    if (!entry) {
      return res.status(400).json({
        error:
          'There are no saved registration management configurations in database.'
      })
    }

    return res.status(200).json({ registrationManagement: entry })
  } catch (err) {
    return handleDatabaseError(res, err)
  }
})

module.exports = registrationManagementRouter
