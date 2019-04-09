const topicsRouter = require('express').Router()
const db = require('../models/index')
const { checkAdmin } = require('../middleware')
const email = require('./email')
const getRandomId = require('../utils/idGeneration').getRandomId
const shuffle = require('shuffle-array')

const format = (topic) => {
  let formatted = topic
  formatted.secret_id = ''
  return formatted
}

const isSecretId = (id) => {
  return id.slice(0, 1) === 'a'
}

const registrationCheck = async (req, res, next) => {
  try {
    const latestConfig = await db.RegistrationManagement.findOne({
      order: [['createdAt', 'DESC']]
    })

    if (!latestConfig || !latestConfig.topic_registration_open) {
      // registration config was not found or the topic registration was closed
      return res
        .status(400)
        .json({ error: 'topic registration is not currently open' })
    }

    // pass request on to the next handler
    next()
  } catch (err) {
    console.error('Error in registrationCheck', err)
    return res.status(500).json({ error: 'database error' })
  }
}

topicsRouter.post('/', registrationCheck, (req, res) => {
  if (!req.body.content)
    return res.status(400).json({ error: 'content undefined' })

  if (!req.body.configuration_id) {
    return res
      .status(400)
      .json({ error: 'Topic must be associated with configuration' })
  }

  const secret_id = getRandomId()

  db.Topic.create({
    active: true,
    configuration_id: req.body.configuration_id,
    content: req.body.content,
    acronym: req.body.acronym,
    secret_id
  })
    .then((topic) => {
      email.sendSecretLink(topic.secret_id, topic.content.email)
      res.status(200).json({ topic })
    })
    .catch((error) => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

topicsRouter.put(
  '/:id',
  (req, res, next) => {
    //skip admin check if id is secret_id
    if (isSecretId(req.params.id)) res.locals.isSecret = true
    next()
  },
  (req, res, next) => {
    if (!res.locals.isSecret) checkAdmin(req, res, next)
    else next()
  },
  (req, res) => {
    //don't try to compare id (integer) to secret_id (string) in db
    if (res.locals.isSecret) {
      db.Topic.findOne({
        where: {
          secret_id: req.params.id
        }
      })
        .then((topic) => {
          if (!topic)
            return res.status(400).json({ error: 'no topic with that id' })
          topic
            .update({
              active: req.body.active,
              content: req.body.content,
              acronym: req.body.acronym
            })
            .then((topic) => {
              topic.reload().then((topic) => {
                topic = format(topic)
                res.status(200).json({ topic })
              })
            })
            .catch((error) => {
              console.log(error)
              res.status(500).json({ error: 'database error' })
            })
        })
        .catch((error) => {
          console.log(error)
          res.status(500).json({ error: 'database error' })
        })
    } else {
      db.Topic.findById(req.params.id)
        .then((topic) => {
          if (!topic)
            return res.status(400).json({ error: 'no topic with that id' })
          topic
            .update({
              active: req.body.active,
              content: req.body.content,
              acronym: req.body.acronym
            })
            .then((topic) => {
              topic.reload().then((topic) => {
                topic = format(topic)
                res.status(200).json({ topic })
              })
            })
            .catch((error) => {
              console.log(error)
              res.status(500).json({ error: 'database error' })
            })
        })
        .catch((error) => {
          console.log(error)
          res.status(500).json({ error: 'database error' })
        })
    }
  }
)

topicsRouter.get('/', checkAdmin, (req, res) => {
  db.Topic.findAll({})
    .then((topics) => {
      res
        .status(200)
        .json({ topics: shuffle(topics.map((topic) => format(topic))) })
    })
    .catch((error) => {
      console.log(error)
      res.status(500).json({ error: 'database error' })
    })
})

/**
 * Active topics for project registration
 */
topicsRouter.get('/active', async (req, res) => {
  try {
    const registrationManagement = await db.RegistrationManagement.findOne({
      order: [['createdAt', 'DESC']]
    })

    if (!registrationManagement) {
      return res
        .status(400)
        .json({ error: 'no active configuration for project registration' })
    }

    const activeTopics = await db.Topic.findAll({
      where: {
        active: true,
        configuration_id: registrationManagement.project_registration_conf
      }
    })

    return res.status(200).json({
      topics: shuffle(activeTopics.map((topic) => format(topic)))
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'database error' })
  }
})

topicsRouter.get('/:id', (req, res) => {
  const id = req.params.id
  if (isSecretId(id)) {
    db.Topic.findOne({
      where: {
        secret_id: id
      }
    })
      .then((topic) => {
        if (!topic)
          return res.status(400).json({ error: 'no topic with that id' })
        topic = format(topic)
        res.status(200).json({ topic })
      })
      .catch((error) => {
        console.log(error)
        res.status(500).json({ error: 'database error' })
      })
  } else {
    db.Topic.findOne({
      where: {
        id: id
      }
    })
      .then((topic) => {
        if (!topic)
          return res.status(400).json({ error: 'no topic with that id' })
        topic = format(topic)
        res.status(200).json({ topic })
      })
      .catch((error) => {
        console.log(error)
        res.status(500).json({ error: 'database error' })
      })
  }
})

topicsRouter.get('/findSecretId/:id', checkAdmin, (req, res) => {
  const id = req.params.id
  if (!id) {
    res.status(400).json({ error: 'topic id undefined' })
  } else {
    db.Topic.findOne({
      where: {
        id: id
      }
    })
      .then((topic) => {
        //console.log('**TOPIC***', topic)
        if (!topic)
          return res.status(400).json({ error: 'no topic with that id' })
        const secret_id = topic.secret_id
        res.status(200).json({ secret_id })
      })
      .catch((error) => {
        console.log(error)
        res.status(500).json({ error: 'database error' })
      })
  }
})

module.exports = topicsRouter
