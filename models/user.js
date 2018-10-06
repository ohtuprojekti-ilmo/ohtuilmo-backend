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

  User.associate = (models) => {
    User.hasMany(models.Membership, {
      foreignKey: 'student_id',
      as: 'memberships',
    })
  }

  User.associate = (models) => {
    User.hasOne(models.Review_answer, {
      foreignKey: 'review_answer_id',
    })
  }

  return User
}