module.exports = (sequelize, Sequelize) => {
  const Registration_management = sequelize.define('registration_management', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_registration_open: {
      type: Sequelize.BOOLEAN
    },
    project_registration_message: {
      type: Sequelize.STRING
    },
    topic_registration_open: {
      type: Sequelize.BOOLEAN
    },
    topic_registration_message: {
      type: Sequelize.STRING
    }
  })

  return Registration_management
}
