const registrationManagementRouter = require('express').Router()
const db = require('../models/index')
const checkAdmin = require('../utils/middleware/routeChecks').checkAdmin

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}
const create = (req, res) => {
  const { registrationManagement } = req.body

  db.RegistrationManagement.create(registrationManagement)
    .then((createdRegistrationManagement) => {
      res.status(201).json(createdRegistrationManagement)
    })
    .catch((error) => {
      handleDatabaseError(res, error)
    })
}

const isDefined = (attribute) => {
  return attribute !== undefined
}

const createChecks = (req, res) => {
  const {
    project_registration_open,
    project_registration_message,
    topic_registration_open,
    topic_registration_message
  } = req.body.registrationManagement

  if (
    !isDefined(project_registration_open) ||
    !isDefined(project_registration_message) ||
    !isDefined(topic_registration_open) ||
    !isDefined(topic_registration_message)
  ) {
    res.status(400).json({
      error: 'All attributes in registrationManagement object must be defined.'
    })
  } else if (
    !project_registration_open &&
    project_registration_message.length === 0
  ) {
    res.status(400).json({
      error:
        'project_registration_message must be provided when project registration is closed'
    })
  } else if (
    !topic_registration_open &&
    topic_registration_message.length === 0
  ) {
    res.status(400).json({
      error:
        'topic_registration_message must be provided when topic registration is closed'
    })
  } else {
    create(req, res)
  }
}

registrationManagementRouter.post('/', checkAdmin, (req, res) => {
  createChecks(req, res)
})

registrationManagementRouter.get('/', (req, res) => {
  db.RegistrationManagement.findOne({ order: [['createdAt', 'DESC']] })
    .then((entry) => {
      if (!entry) {
        res.status(400).json({
          error:
            'There are no saved registration management configurations in database.'
        })
      } else {
        res.status(200).json({ registrationManagement: entry })
      }
    })
    .catch((error) => {
      handleDatabaseError(res, error)
    })
})

module.exports = registrationManagementRouter
