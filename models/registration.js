module.exports = (sequelize, Sequelize) => {
  const Registration = sequelize.define('registration', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: Sequelize.JSONB
    }
  })

  return Registration
}