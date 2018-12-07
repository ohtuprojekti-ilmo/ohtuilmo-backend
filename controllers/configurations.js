const configurationsRouter = require('express').Router()
const db = require('../models/index')
const checkAdmin = require('../utils/middleware/routeChecks').checkAdmin

// determines which associated models are returned with configuration
const includeArray = ['review_question_set_1', 'review_question_set_2', 'registration_question_set']

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

const returnPopulatedConfiguration = (req, res, configuration) => {
  db.Configuration.findOne({
    where: { id: configuration.id },
    include: includeArray
  })
    .then(foundConfiguration => {
      res.status(200).json({ configuration: foundConfiguration })
    })
    .catch(error => handleDatabaseError(res, error))
}

const setForeignKeys = async (configuration, req, res) => {
  try {
    if (req.body.registrations) {
      await configuration.setRegistrations(req.body.registrations)
    }
    if (req.body.review_question_set_1) {
      await configuration.setReview_question_set_1(req.body.review_question_set_1)
    }
    if (req.body.review_question_set_2) {
      await configuration.setReview_question_set_2(req.body.review_question_set_2)
    }
    if (req.body.registration_question_set) {
      await configuration.setRegistration_question_set(req.body.registration_question_set)
    }
    returnPopulatedConfiguration(req, res, configuration)
  } catch (error) {
    handleDatabaseError(res, error)
  }
}

const createConfiguration = (req, res) => {
  db.Configuration.create({
    name: req.body.name,
    content: req.body.content,
    active: req.body.active
  })
    .then(created => setForeignKeys(created, req, res))
    .catch(error => handleDatabaseError(res, error))
}

const updateConfiguration = (req, res, configuration) => {
  configuration
    .update({
      name: req.body.active,
      content: req.body.content,
      active: req.body.active
    })
    .then(configuration => setForeignKeys(configuration, req, res))
    .catch(error => handleDatabaseError(res, error))
}

configurationsRouter.post('/', checkAdmin, (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'configuration name undefined' })
  }
  if (req.body.active) {
    // make previous active configuration inactive
    db.Configuration.update({ active: false }, { where: { active: true } })
      .then(() => createConfiguration(req, res))
      .catch(error => handleDatabaseError(res, error))
  } else {
    createConfiguration(req, res)
  }
})

configurationsRouter.put('/:id', checkAdmin, (req, res) => {
  db.Configuration.findOne({ where: { id: req.params.id } }).then(configuration => {
    if (!configuration) {
      return res.status(400).json({ error: 'no configuration with that id' })
    }
    if (req.body.active) {
      // make previous active configuration inactive
      db.Configuration.update({ active: false }, { where: { active: true } })
        .then(() => {
          updateConfiguration(req, res, configuration)
        })
        .catch(error => handleDatabaseError(res, error))
    } else {
      updateConfiguration(req, res, configuration)
    }
  })
})

configurationsRouter.get('/', checkAdmin, (req, res) => {
  db.Configuration.findAll({
    include: includeArray
  })
    .then(configurations => {
      res.status(200).json({ configurations })
    })
    .catch(error => handleDatabaseError(res, error))
})

configurationsRouter.get('/active', (req, res) => {
  db.Configuration.findOne({
    where: { active: true },
    include: includeArray
  })
    .then(configuration => {
      res.status(200).json({ configuration })
    })
    .catch(error => handleDatabaseError(res, error))
})

module.exports = configurationsRouter
