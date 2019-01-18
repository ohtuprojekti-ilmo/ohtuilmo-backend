const Sequelize = require('sequelize')
const config = require('../config/sequelize.json')

const db = {}

db.connect = () => {
  const sequelizeConfig = config[process.env.NODE_ENV]

  setTimeout(function() {
    const sequelize = new Sequelize(sequelizeConfig)

    sequelize
      .authenticate()
      .then(() => {
        console.log('Connection has been established successfully.')
      })
      .catch((err) => {
        console.error('Unable to connect to the database:', err)
      })

    const UserModel = require('./user')
    const GroupModel = require('./group')
    const MembershipModel = require('./membership')
    const TopicModel = require('./topic')
    const TopicDateModel = require('./topic_date')
    const RegistrationModel = require('./registration')
    const ConfigurationModel = require('./configuration')
    const RegistrationQuestionSetModel = require('./registration_question_set')
    const ReviewQuestionSetModel = require('./review_question_set')
    //const Review = require('./review')
    //const Review_answer = require('./review_answer')
    const RegistrationManagementModel = require('./registration_management')

    const User = UserModel(sequelize, Sequelize)
    const Group = GroupModel(sequelize, Sequelize)
    const Membership = MembershipModel(sequelize, Sequelize)
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

    db.User = User
    db.Group = Group
    db.Membership = Membership
    db.Topic = Topic
    db.TopicDate = TopicDate
    db.Registration = Registration
    db.Configuration = Configuration
    db.RegistrationQuestionSet = RegistrationQuestionSet
    db.ReviewQuestionSet = ReviewQuestionSet
    db.RegistrationManagement = RegistrationManagement

    db.User.associate(db)
    db.Group.associate(db)
    db.Configuration.associate(db)
    db.Registration.associate(db)

    db.sequelize = sequelize
    db.Sequelize = Sequelize
    sequelize.sync()
  }, 9000)
}

module.exports = db
