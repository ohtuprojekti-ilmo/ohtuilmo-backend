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
      foreignKey: 'id',
      as: 'groups',
    })
  }

  return Group
}