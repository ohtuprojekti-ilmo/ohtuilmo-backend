'use strict'
module.exports = (sequelize, Sequelize) => {
  const Group = sequelize.define('group', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    group_name: {
      type: Sequelize.STRING
    }
  })

  Group.associate = (models) => {
    Group.hasMany(models.Membership, {
      foreignKey: 'group_id',
      as: 'Memberships'
    })
  }

  return Group
}