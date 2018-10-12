module.exports = (sequelize, Sequelize) => {
  const Review_answer = sequelize.define('review_answer', {
    review_answer_id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    answers: {
      type: Sequelize.JSONB
    }
  })

  Review_answer.associate = (models) => {
    Review_answer.belongsTo(models.User, {
      foreignKey: 'review_id',
    })
  }

  return Review_answer
}