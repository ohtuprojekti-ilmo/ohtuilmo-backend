const instructorReviewRouter = require('express').Router()
const db = require('../models/index')
const { checkLogin, checkAdmin } = require('../middleware')

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

const isNil = (value) => value === undefined || value === null

const validateAnswerSheet = (instructorReview) => {
  if (!instructorReview) {
    return 'No instructor review found'
  }

  const {
    user_id,
    answer_sheet,
    configuration_id,
    review_round
  } = instructorReview

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
  if (question.answer > 100000) {
    return 'Number question can not be that large'
  }
  return null
}

const create = async (req, res) => {
  const { instructorReview } = req.body
  try {
    const sentAnswerSheet = await db.PeerReview.create(instructorReview)
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

  const error = validateAnswerSheet(instructorReview)

  if (error) {
    return res.status(400).json({ error })
  }
  create(req, res)
})

instructorReviewRouter.get('/', checkLogin, async (req, res) => {
  try {
    const config = await db.Configuration.findOne({ where: { active: true } })
    const entries = await db.PeerReview.findAll({
      where: {
        user_id: req.user.id,
        configuration_id: config.id
      }
    })

    return res.status(200).json(entries)
  } catch (err) {
    return handleDatabaseError(res, err)
  }
})

instructorReviewRouter.get('/all', checkAdmin, async (req, res) => {
  try {
    const reviews = await db.PeerReview.findAll({
      include: ['user']
    })
    return res.status(200).json(reviews)
  } catch (error) {
    return handleDatabaseError(res, error)
  }
})

instructorReviewRouter.get('/forInstructor', checkLogin, async (req, res) => {
  try {
    const instructedGroups = await db.Group.findAll({
      where: { instructorId: req.user.id }
    })

    if (instructedGroups.length === 0) {
      return res.status(401).json({ error: 'Not instructor' })
    }

    const instructedConfigurations = instructedGroups.map(
      (group) => group.configurationId
    )

    const groupsOfInstructedConfigurations = await db.Group.findAll({
      where: { configurationId: instructedConfigurations },
      include: [
        {
          as: 'students',
          model: db.User,
          attributes: ['student_number', 'first_names', 'last_name'],
          through: { attributes: [] }
        },
        {
          as: 'configuration',
          model: db.Configuration
        },
        {
          as: 'instructor',
          model: db.User
        }
      ]
    })

    const allAnswers = await db.PeerReview.findAll({
      include: ['user']
    })

    const filterAndFormatAnswers = (answers, group, round) => {
      return answers
        .filter(
          (answer) =>
            group.students
              .map(({ student_number }) => student_number)
              .includes(answer.user.student_number) &&
            answer.configuration_id === group.configurationId &&
            answer.review_round === round
        )
        .map((answer) => {
          return {
            student: {
              first_names: answer.user.first_names,
              last_name: answer.user.last_name
            },
            answer_sheet: answer.answer_sheet
          }
        })
    }

    const answersByGroup = groupsOfInstructedConfigurations.reduce(
      (list, group) => {
        const round1Answers = filterAndFormatAnswers(allAnswers, group, 1)
        const round2Answers = filterAndFormatAnswers(allAnswers, group, 2)

        list = list.concat({
          group: {
            id: group.id,
            name: group.name,
            studentNames: group.students.map(
              (student) => student.first_names + ' ' + student.last_name
            ),
            configurationId: group.configurationId,
            configurationName: group.configuration.name,
            instructorName: group.instructor
              ? group.instructor.first_names + ' ' + group.instructor.last_name
              : ''
          },
          round1Answers,
          round2Answers
        })

        return list
      },
      []
    )

    return res.status(200).json(answersByGroup)
  } catch (error) {
    return handleDatabaseError(res, error)
  }
})

instructorReviewRouter.delete('/:id', checkAdmin, async (req, res) => {
  const instructorReviewId = parseInt(req.params.id, 10)
  if (isNaN(instructorReviewId)) {
    return res.status(400).json({ error: 'invalid id' })
  }

  try {
    const targetSet = await db.PeerReview.findByPk(instructorReviewId)
    if (!targetSet) {
      // already deleted, eh, just return ok
      return res.status(204).end()
    }

    await targetSet.destroy()
    return res.status(204).end()
  } catch (err) {
    console.error(
      'error while deleting question set with id',
      req.params.id,
      err
    )
    return res.status(500).json({ error: 'internal server error' })
  }
})

module.exports = instructorReviewRouter
