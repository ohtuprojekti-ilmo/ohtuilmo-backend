module.exports = (sequelize, Sequelize) => {
  const Configuration = sequelize.define(
    'configuration',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.JSONB
      }
    },
    {
      underscored: true
    }
  )

  Configuration.associate = (models) => {
    Configuration.hasMany(models.Registration) // used only for creating the foreign key in registrations, should be removed and implemented from registration side
    Configuration.belongsTo(models.ReviewQuestionSet, {
      as: 'review_question_set_1'
    })
    Configuration.belongsTo(models.ReviewQuestionSet, {
      as: 'review_question_set_2'
    })
    Configuration.belongsTo(models.RegistrationQuestionSet)
    Configuration.belongsTo(
      models.CustomerReviewQuestionSet
    ) /* , { as: 'customer_review_question_set' } */
  }

  return Configuration
}
