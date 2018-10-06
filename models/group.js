module.exports = (sequelize, Sequelize) => {
    const Group = sequelize.define('group', {
      group_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      groupName: {
          type: Sequalize.STRING
      }
    })

    Group.associate = (models) => {
      Group.hasMany(models.Membership, {
        foreignKey: 'group_id',
        as: 'groups',
      })
    }
  
    return Group
  }