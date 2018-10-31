module.exports = (sequelize, Sequelize) => {
  const Membership = sequelize.define('membership', {
    membership_id: {
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