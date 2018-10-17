module.exports = (sequelize, Sequelize) => {
  const Topic = sequelize.define('topic', {
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    content: {
      type: Sequelize.JSONB
    }
  })

  return Topic
}