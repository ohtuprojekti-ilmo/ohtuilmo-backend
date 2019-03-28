const customerReviewRouter = require('express').Router()
const db = require('../models/index')
const { checkLogin, checkAdmin } = require('../middleware')

const handleDatabaseError = (res, error) => {
  console.log(error)
  res.status(500).json({ error: 'database error' })
}

const isNil = (value) => value === undefined || value === null

const validateAnswerSheet = (customerReview) => {
  if (!customerReview) {
    return 'No customer review found'
  }

  const { group_id, answer_sheet } = customerReview

  if (isNil(group_id) || isNil(answer_sheet)) {
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
    } else if (question.type !== 'info') {
      return 'Invalid question type in answer sheet'
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
  const { customerReview } = req.body
  try {
    const sentAnswerSheet = await db.CustomerReview.create(customerReview)
    return res.status(201).json(sentAnswerSheet)
  } catch (err) {
    return handleDatabaseError(res, err)
  }
}

customerReviewRouter.post('/', async (req, res) => {
  const { customerReview } = req.body

  /*   if (!customerReview.group_id || !customerReview.configuration_id || !customerReview.answer_sheet) {
    return res.status(401).json({ error: 'Missing data' })
  } */

  const error = validateAnswerSheet(customerReview)

  if (error) {
    return res.status(400).json({ error })
  }
  create(req, res)
})

customerReviewRouter.get('/', checkLogin, async (req, res) => {
  try {
    const entries = await db.CustomerReview.findAll({
      where: {
        group_id: req.group.id
      }
    })

    return res.status(200).json(entries)
  } catch (err) {
    return handleDatabaseError(res, err)
  }
})

customerReviewRouter.get('/all', checkAdmin, async (req, res) => {
  try {
    const reviews = await db.CustomerReview.findAll({
      include: ['group']
    })
    return res.status(200).json(reviews)
  } catch (error) {
    return handleDatabaseError(res, error)
  }
})

//Haetaan topicin secret idllä data sisään customer review sivulle (groupid, groupname ja config)
customerReviewRouter.get('/:id', async (req, res) => {
  //Sisään tulee topicin secret_id hae sillä topic -> group, groupista id nimi ja config
  const id = req.params.id
  try {
    const topic = await db.Topic.findOne({
      where: {
        secret_id: id
      }
    })

    if (!topic) {
      return res.status(400).json({ error: 'no topic with that id' })
    }

    //Tänne pääsee ja topic löytyy

    const group = await db.Group.findOne({
      where: {
        topicId: topic.id
      }
    })

    if (!group) {
      return res.status(400).json({ error: 'no group found for topic' })
    }

    //data tulee läpi

    res.status(200).json({
      groupId: group.id,
      groupName: group.name,
      configuration: group.configurationId
    })
  } catch (error) {
    console.error('Error while updating group', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = customerReviewRouter
