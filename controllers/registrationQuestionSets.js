const registrationQuestionSetsRouter = require('express').Router()
const db = require('../models/index')
const checkAdmin = require('../utils/middleware/routeChecks').checkAdmin

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

const createRegistrationQuestionSet = (req, res) => {
  db.RegistrationQuestionSet
    .create({
      name: req.body.name,
      questions: req.body.questions
    })
    .then(createdSet => res.status(200).json({ createdSet }))
    .catch(error => handleDatabaseError(res, error))
}

const updateRegistrationQuestionSet = (req, res, questionSet) => {
  questionSet
    .update({
      name: req.body.name,
      questions: req.body.questions
    })
    .then(questionSet => {
      questionSet
        .reload()
        .then(updatedSet => {
          res.status(200).json({ updatedSet })
        })
        .catch(error => handleDatabaseError(res, error))
    })
    .catch(error => handleDatabaseError(res, error))
}

registrationQuestionSetsRouter.post('/', (req, res) => {
  createRegistrationQuestionSet(req, res)
})

registrationQuestionSetsRouter.put('/:id', (req, res) => {
  db.RegistrationQuestionSet
    .findOne({ where: { id: req.params.id } })
    .then(foundSet => {
      if (!foundSet)
        return res.status(400).json({ error: 'no question set with that id' })
      updateRegistrationQuestionSet(req, res, foundSet)
    }
    )
})

registrationQuestionSetsRouter.get('/', (req, res) => {
  db.RegistrationQuestionSet
    .findAll({})
    .then(foundSets => {
      res.status(200).json({ foundSets })
    })
    .catch(error => handleDatabaseError(res, error))
})

module.exports = registrationQuestionSetsRouter
