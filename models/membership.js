module.exports = (sequelize, Sequelize) => {
  const Membership = sequelize.define('membership', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    role: {
      type: Sequelize.STRING
    }
  }, {
    underscored: true
  })

  return Membership
}