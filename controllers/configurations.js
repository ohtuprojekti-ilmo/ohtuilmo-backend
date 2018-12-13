const configurationsRouter = require('express').Router()
const db = require('../models/index')
const checkAdmin = require('../utils/middleware/routeChecks').checkAdmin

// determines which associated models are returned with configuration
const includeArray = ['review_question_set_1', 'review_question_set_2', 'registration_question_set']

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

const returnPopulatedConfiguration = (req, res, unPopulatedConfiguration) => {
  db.Configuration.findOne({
    where: { id: unPopulatedConfiguration.id },
    include: includeArray
  })
    .then(foundConfiguration => {
      res.status(200).json({ configuration: foundConfiguration })
    })
    .catch(error => handleDatabaseError(res, error))
}

const setForeignKeys = async (configuration, req, res) => {
  try {
    if (req.body.review_question_set_1_id) {
      db.ReviewQuestionSet.findOne({ where: { id: req.body.review_question_set_1_id } })
        .then(async foundSet => {
          if (!foundSet) return res.status(400).json({ error: 'no review question set with that id' })
          await configuration.setReview_question_set_1(req.body.review_question_set_1_id)
        })
    }
    if (req.body.review_question_set_2_id) {
      db.ReviewQuestionSet.findOne({ where: { id: req.body.review_question_set_2_id } })
        .then(async foundSet => {
          if (!foundSet) return res.status(400).json({ error: 'no review question set with that id' })
          await configuration.setReview_question_set_2(req.body.review_question_set_2_id)
        })
    }
    if (req.body.registration_question_set_id) {
      db.RegistrationQuestionSet.findOne({ where: { id: req.body.registration_question_set_id } })
        .then(async foundSet => {
          if (!foundSet) return res.status(400).json({ error: 'no registration question set with that id' })
          await configuration.setRegistration_question_set(req.body.review_question_set_1_id)
        })
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
      name: req.body.name,
      content: req.body.content,
      active: req.body.active
    })
    .then(configuration => setForeignKeys(configuration, req, res))
    .catch(error => handleDatabaseError(res, error))
}

const createChecks = (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'name undefined' })
  db.Configuration
    .findOne({ where: { name: req.body.name } })
    .then(foundSet => {
      if (foundSet) return res.status(400).json({ error: 'name already in use' })
      if (req.body.active === true) {
        // make previous active configuration inactive
        db.Configuration.update({ active: false }, { where: { active: true } })
          .then(() => createConfiguration(req, res))
          .catch(error => handleDatabaseError(res, error))
      } else {
        createConfiguration(req, res)
      }
    })
    .catch(error => handleDatabaseError(res, error))
}

const updateChecks = (req, res) => {
  if (isNaN(req.params.id)) return res.status(400).json({ error: 'invalid id' })
  if (!req.body.name) return res.status(400).json({ error: 'name undefined' })
  db.Configuration
    .findOne({ where: { name: req.body.name } })
    .then(duplicateNameConfiguration => {
      if (duplicateNameConfiguration && (duplicateNameConfiguration.id !== parseInt(req.params.id))) {
        return res.status(400).json({ error: 'name already in use' })
      }
      db.Configuration
        .findOne({ where: { id: req.params.id } })
        .then(foundConfiguration => {
          if (!foundConfiguration) return res.status(400).json({ error: 'no review question set with that id' })
          if (req.body.active === true) {
            // make previous active configuration inactive
            db.Configuration.update({ active: false }, { where: { active: true } })
              .then(() => {
                updateConfiguration(req, res, foundConfiguration)
              })
              .catch(error => handleDatabaseError(res, error))
          } else {
            updateConfiguration(req, res, foundConfiguration)
          }
        })
    })
}

configurationsRouter.post('/', checkAdmin, (req, res) => {
  createChecks(req, res)
})

configurationsRouter.put('/:id', checkAdmin, (req, res) => {
  updateChecks(req, res)
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
