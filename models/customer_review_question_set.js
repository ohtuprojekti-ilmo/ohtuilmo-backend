module.exports = (sequelize, Sequelize) => {
  const Customer_review_question_set = sequelize.define(
    'customer_review_question_set',
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING
      },
      questions: {
        type: Sequelize.JSONB
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    }
  )

  return Customer_review_question_set
}
