'use strict'
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
    student_number: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    username: {
      type: Sequelize.STRING
    },
    first_names: {
      type: Sequelize.STRING
    },
    last_name: {
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
      foreignKey: 'student_number',
      as: 'Memberships'
    })
    User.hasMany(models.Registration, {
      foreignKey: 'student_number',
      as: 'Registrations'
    })
    // User.hasOne(models.Review_answer, {
    //   foreignKey: 'id',
    // })
  }

  return User
}
