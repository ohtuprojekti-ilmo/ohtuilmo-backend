const reviewQuestionSetsRouter = require('express').Router()
const db = require('../models/index')
const checkAdmin = require('../utils/middleware/routeChecks').checkAdmin

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error ' })
}

const createReviewQuestionSet = (req, res) => {
  db.ReviewQuestionSet
    .create({
      name: req.body.name,
      questions: req.body.questions
    })
    .then(createdSet => res.status(200).json({ createdSet }))
    .catch(error => handleDatabaseError(res, error))
}

const updateReviewQuestionSet = (req, res, questionSet) => {
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

reviewQuestionSetsRouter.post('/', checkAdmin, (req, res) => {
  createReviewQuestionSet(req, res)
})

reviewQuestionSetsRouter.put('/:id', checkAdmin, (req, res) => {
  db.ReviewQuestionSet
    .findOne({ where: { id: req.params.id } })
    .then(foundSet => {
      if (!foundSet) return res.status(400).json({ error: 'no registration_question with that id' })
      updateReviewQuestionSet(req, res, foundSet)
    })
})

reviewQuestionSetsRouter.get('/', checkAdmin, (req, res) => {
  db.ReviewQuestionSet
    .findAll({})
    .then(questionSets => {
      res.status(200).json({ questionSets })
    })
    .catch(error => handleDatabaseError(res, error))
})

module.exports = reviewQuestionSetsRouter
