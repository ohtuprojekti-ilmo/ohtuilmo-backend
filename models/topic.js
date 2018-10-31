module.exports = (sequelize, Sequelize) => {
  const Topic = sequelize.define('topic', {
    topic_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
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