const router = require('express').Router()
const { Op } = require('sequelize')
const db = require('../models')
const { checkAdmin } = require('../middleware')

const formatGroup = (dbGroup) => {
  // pluck only fields we know and need, map student object to student_number
  const {
    id,
    name,
    createdAt,
    updatedAt,
    topicId,
    configurationId,
    instructorId,
    students
  } = dbGroup
  return {
    id,
    name,
    createdAt,
    updatedAt,
    topicId,
    instructorId,
    configurationId,
    studentIds: students.map(({ student_number }) => student_number)
  }
}

router.get('/', checkAdmin, async (req, res) => {
  const groups = await db.Group.findAll({
    include: [
      {
        as: 'students',
        model: db.User,
        attributes: ['student_number'], // only select the student number
        through: { attributes: [] } // don't ignore junction table stuff
      }
    ]
  })
  const deserialized = groups.map(formatGroup)
  res.json(deserialized)
})

const isNil = (obj) => obj === null || obj === undefined

const topicDoesNotExist = async (topicId) => {
  const foundTopic = await db.Topic.findByPk(topicId)
  return !foundTopic
}

const configDoesNotExist = async (configId) => {
  const config = await db.Configuration.findByPk(configId)
  return !config
}

const instructorDoesNotExist = async (studentNumber) => {
  const user = await db.User.findByPk(studentNumber)
  return !user
}

const findNonExistingStudents = async (studentNumbers) => {
  const students = await db.User.findAll({
    where: {
      student_number: {
        [Op.in]: studentNumbers
      }
    }
  })

  const expectedStudentNumbers = new Set(
    students.map((user) => user.student_number)
  )

  return studentNumbers.filter(
    (studentNumber) => !expectedStudentNumbers.has(studentNumber)
  )
}

const validateGroup = async (body) => {
  if (!body) return 'POST body is missing'

  const { name, topicId, configurationId, instructorId, studentIds } = body

  if (isNil(name) || typeof name !== 'string') return 'name is missing'
  if (isNil(topicId) || typeof topicId !== 'number') return 'topicId is missing'
  if (isNil(configurationId) || typeof configurationId !== 'number')
    return 'configurationId is missing'
  if (isNil(instructorId) || typeof instructorId !== 'string')
    return 'instructorId is missing'
  if (isNil(studentIds) || !Array.isArray(studentIds))
    return 'studentIds is missing'
  if (studentIds.some((id) => isNil(id) || typeof id !== 'string'))
    return 'students has invalid student numbers'

  if (await topicDoesNotExist(topicId)) {
    return `Topic ${topicId} does not exist`
  }

  if (await configDoesNotExist(configurationId)) {
    return `Configuration ${configurationId} does not exist`
  }

  if (await instructorDoesNotExist(instructorId)) {
    return `Instructor user ${instructorId} does not exist`
  }

  const nonExistingStudents = await findNonExistingStudents(studentIds)
  if (nonExistingStudents.length > 0) {
    return nonExistingStudents.length === 1
      ? `Student "${nonExistingStudents[0]}" does not exist`
      : `Students [${nonExistingStudents.join(', ')}] do not exist`
  }

  return null
}

const formatCreatedGroup = (dbGroup, dbGroupStudents) => {
  const {
    id,
    name,
    createdAt,
    updatedAt,
    topicId,
    configurationId,
    instructorId
  } = dbGroup
  return {
    id,
    name,
    createdAt,
    updatedAt,
    topicId,
    instructorId,
    configurationId,
    // setStudents returns an array of the created group_students rows, but that
    // array seems to be wrappend in another array too?
    studentIds: dbGroupStudents[0].map(
      ({ userStudentNumber }) => userStudentNumber
    )
  }
}

router.post('/', checkAdmin, async (req, res) => {
  const validationError = await validateGroup(req.body)

  if (validationError !== null) {
    return res.status(400).json({ error: validationError })
  }

  const { name, topicId, configurationId, instructorId, studentIds } = req.body

  // Wrap group creation and group_students join table setting in a transaction
  // so that the group is not created if a foreign key violation occurs
  // during setStudents.
  //
  // Group.create returns the created group, and setStudents returns the
  // group_students join table rows that were created.
  try {
    const { createdGroup, groupStudents } = await db.sequelize.transaction(
      async (transaction) => {
        const options = { transaction }

        const createdGroup = await db.Group.create(
          {
            name,
            topicId,
            configurationId,
            instructorId
          },
          options
        )
        const groupStudents = await createdGroup.setStudents(
          studentIds,
          options
        )

        return {
          createdGroup,
          groupStudents
        }
      }
    )
    res.json(formatCreatedGroup(createdGroup, groupStudents))
  } catch (err) {
    console.error('Error while creating group', err)
    res.json(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
