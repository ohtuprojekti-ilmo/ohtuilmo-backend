module.exports = (sequelize, Sequelize) => {
  const Group = sequelize.define('group', {
    group_id: {
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
      as: 'groups',
    })
  }

  return Group
}