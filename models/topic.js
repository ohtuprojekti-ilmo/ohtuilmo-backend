module.exports = (sequelize, Sequelize) => {
  const Topic = sequelize.define('topic', {
    active: {
      type: Sequelize.BOOLEAN
    },
    content: {
      type: Sequelize.JSONB
    }
  })

  return Topic
}