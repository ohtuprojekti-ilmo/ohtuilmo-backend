module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
    student_id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    firstNames: {
      type: Sequelize.STRING
    },
    lastName: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    admin: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  })

  return User
}