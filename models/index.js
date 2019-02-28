const Sequelize = require('sequelize')
const config = require('../config/sequelize.json')

const db = {}

db.connect = () => {
  const sequelizeConfig = config[process.env.NODE_ENV]

  const sequelize = new Sequelize(sequelizeConfig)

  sequelize
    .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.')
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err)
      process.exit(1)
    })

  const UserModel = require('./user')
  const GroupModel = require('./group')
  const TopicModel = require('./topic')
  const TopicDateModel = require('./topic_date')
  const RegistrationModel = require('./registration')
  const ConfigurationModel = require('./configuration')
  const RegistrationQuestionSetModel = require('./registration_question_set')
  const ReviewQuestionSetModel = require('./review_question_set')
  //const Review = require('./review')
  //const Review_answer = require('./review_answer')
  const RegistrationManagementModel = require('./registration_management')
  const PeerReviewModel = require('./peer_review')

  const User = UserModel(sequelize, Sequelize)
  const Group = GroupModel(sequelize, Sequelize)
  const Topic = TopicModel(sequelize, Sequelize)
  const TopicDate = TopicDateModel(sequelize, Sequelize)
  const Registration = RegistrationModel(sequelize, Sequelize)
  const Configuration = ConfigurationModel(sequelize, Sequelize)
  const RegistrationQuestionSet = RegistrationQuestionSetModel(
    sequelize,
    Sequelize
  )
  const ReviewQuestionSet = ReviewQuestionSetModel(sequelize, Sequelize)
  const RegistrationManagement = RegistrationManagementModel(
    sequelize,
    Sequelize
  )
  const PeerReview = PeerReviewModel(sequelize, Sequelize)

  db.User = User
  db.Group = Group
  db.Topic = Topic
  db.TopicDate = TopicDate
  db.Registration = Registration
  db.Configuration = Configuration
  db.RegistrationQuestionSet = RegistrationQuestionSet
  db.ReviewQuestionSet = ReviewQuestionSet
  db.RegistrationManagement = RegistrationManagement
  db.PeerReview = PeerReview

  Group.belongsTo(Topic, {
    as: 'topic'
  })
  Group.belongsTo(Configuration, {
    as: 'configuration'
  })
  Group.belongsToMany(User, {
    through: 'group_students',
    as: 'students'
  })
  User.belongsToMany(Group, {
    through: 'group_students',
    as: 'groups'
  })
  Group.belongsTo(User, {
    as: 'instructor',
    foreignKey: 'instructorId'
  })

  PeerReview.belongsTo(User, {
    as: 'user',
    foreignKey: 'user_id'
  })

  PeerReview.belongsTo(Configuration, {
    as: 'configuration',
    foreignKey: 'configuration_id'
  })

  db.Configuration.associate(db)
  db.Registration.associate(db)

  db.sequelize = sequelize
  db.Sequelize = Sequelize
  sequelize.sync()
}

module.exports = db
