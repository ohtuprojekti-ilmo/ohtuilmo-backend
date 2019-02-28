const peerReviewRouter = require('express').Router()
const db = require('../models/index')
const { checkLogin } = require('../middleware')

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

const isNil = (value) => value === undefined || value === null

const validateAnswerSheet = (peerReview) => {
  if (!peerReview) {
    return 'No peer review found'
  }

  const { user_id, answer_sheet, configuration_id, review_round } = peerReview

  if (
    isNil(user_id) ||
    isNil(answer_sheet) ||
    isNil(configuration_id) ||
    isNil(review_round)
  ) {
    return 'All attributes must be defined.'
  }
  let error = null
  for (let question of answer_sheet) {
    if (question.type === 'text') {
      error = validateTextAnswer(question)
      if (error) {
        return error
      }
    } else if (question.type === 'radio') {
      error = validateRadioAnswer(question)
      if (error) {
        return error
      }
    } else if (question.type === 'number') {
      error = validateNumberAnswer(question)
      if (error) {
        return error
      }
    } else if (question.type !== 'info') {
      return 'Invalid question type in asnwer sheet'
    }
  }
  return null
}

const validateTextAnswer = (question) => {
  if (question.answer.length === 0) {
    return 'You must answer all questions'
  }
  if (question.answer.length < 30) {
    return 'Text answers must be over 30 characters long.'
  }
  if (question.answer.length > 5000) {
    return 'Text answer must be less than 5000 characters.'
  }
  return null
}

const validateRadioAnswer = (question) => {
  let error = null
  Object.values(question.peers).forEach((value) => {
    if (isNil(value)) {
      error = 'You must answer all questions'
    }
  })
  return error
}

const validateNumberAnswer = (question) => {
  if (isNil(question.answer)) {
    return 'You must answer all questions'
  }
  if (question.answer < 0) {
    return 'Number answer can not be negative'
  }
  if (question.answer > 100000) {
    return 'Number question can not be that large'
  }
  return null
}

const create = async (req, res) => {
  const { peerReview } = req.body
  console.log(peerReview)
  try {
    const sentAnswerSheet = await db.PeerReview.create(peerReview)
    return res.status(201).json(sentAnswerSheet)
  } catch (err) {
    return handleDatabaseError(res, err)
  }
}

peerReviewRouter.post('/', checkLogin, async (req, res) => {
  const { peerReview } = req.body

  const error = validateAnswerSheet(peerReview)

  if (error) {
    return res.status(400).json({ error })
  }
  create(req, res)
})

peerReviewRouter.get('/', checkLogin, async (req, res) => {
  try {
    const entry = await db.PeerReview.findOne({
      where: { user_id: req.user.id }
    })

    if (entry) {
      return res.status(200).json(true)
    }

    return res.status(200).json(false)
  } catch (err) {
    return handleDatabaseError(res, err)
  }
})

module.exports = peerReviewRouter
