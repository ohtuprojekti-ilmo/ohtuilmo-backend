module.exports = (sequelize, Sequelize) => {
    const Membership = sequelize.define('membership', {
      membership_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      answers: {
        type: Sequelize.JSONB
      } 
    })

    Membership.associate = (models) => {
      Membership.hasOne(models.Group, {
        foreignKey: 'group_id',
      })
    }

    Membership.associate = (models) => {
      Membership.hasOne(models.User, {
        foreignKey: 'student_number',
      })
    }
  
    return Membership
  }