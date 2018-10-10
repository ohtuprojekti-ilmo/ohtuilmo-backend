module.exports = (sequelize, Sequelize) => {
  const Review = sequelize.define('review', {
    review_id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    year: {
      type: Sequelize.INTEGER
    },
    term: {
      type: Sequelize.STRING
    },
    questions: {
      type: Sequelize.JSONB
    }
  })

  Review.associate = (models) => {
    Review.hasMany(models.Review_answer, {
      foreignKey: 'review_id',
      as: 'review answers',
    })
  }

  return Review
}