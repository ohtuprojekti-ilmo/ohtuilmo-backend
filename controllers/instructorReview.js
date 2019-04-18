const instructorReviewRouter = require('express').Router()
const db = require('../models/index')
const { checkLogin } = require('../middleware')

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

const isNil = (value) => value === undefined || value === null

const validateAnswerSheet = (instructorReview) => {
  if (!instructorReview) {
    return 'No instructor review found'
  }

  const { user_id, answer_sheet } = instructorReview

  if (isNil(user_id) || isNil(answer_sheet)) {
    return 'All attributes must be defined.'
  }
  let error = null
  for (let question of answer_sheet) {
    if (question.type === 'text') {
      error = validateTextAnswer(question)
      if (error) {
        return error
      }
    } else if (question.type === 'number') {
      error = validateNumberAnswer(question)
      if (error) {
        return error
      }
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

const validateNumberAnswer = (question) => {
  if (isNil(question.answer)) {
    return 'You must answer all questions'
  }
  if (question.answer < 0) {
    return 'Number answer can not be negative'
  }
  if (question.answer > 5) {
    return 'Grade can not be over 5.'
  }
  return null
}

const create = async (req, res) => {
  const { instructorReview } = req.body
  let { answer_sheet, group_name, group_id, user_id } = instructorReview
  if (group_name) {
    answer_sheet = {
      answer_sheet,
      group_name,
      group_id
    }
  }
  const newAnswerSheet = {
    answer_sheet,
    user_id
  }

  try {
    const sentAnswerSheet = await db.InstructorReview.create(newAnswerSheet)
    return res.status(201).json(sentAnswerSheet)
  } catch (err) {
    return handleDatabaseError(res, err)
  }
}

instructorReviewRouter.post('/', checkLogin, async (req, res) => {
  const { instructorReview } = req.body

  if (!instructorReview.user_id || req.user.id !== instructorReview.user_id) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  const error = validateAnswerSheet(instructorReview.answer_sheet)
  if (error) {
    return res.status(400).json({ error })
  }
  create(req, res)
})

instructorReviewRouter.get('/', checkLogin, async (req, res) => {
  try {
    const entries = await db.InstructorReview.findAll({
      where: {
        user_id: req.user.id
      }
    })

    return res.status(200).json(entries)
  } catch (err) {
    return handleDatabaseError(res, err)
  }
})

instructorReviewRouter.get(
  '/getAllAnsweredGroupId',
  checkLogin,
  async (req, res) => {
    try {
      const reviews = await db.InstructorReview.findAll({
        where: {
          user_id: req.user.id
        }
      })
      const reviewGroups = reviews.map((review) => review.answer_sheet.group_id)

      return res.status(200).json(reviewGroups)
    } catch (error) {
      return handleDatabaseError(res, error)
    }
  }
)

module.exports = instructorReviewRouter
