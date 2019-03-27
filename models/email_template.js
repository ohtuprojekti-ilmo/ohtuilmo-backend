'use strict'
module.exports = (sequelize, DataTypes) => {
  const EmailTemplate = sequelize.define(
    'email_templates',
    {
      topic_accepted_fin: DataTypes.STRING,
      topic_rejected_fin: DataTypes.STRING,
      topic_accepted_eng: DataTypes.STRING,
      topic_rejected_eng: DataTypes.STRING
    },
    {
      underscored: true
    }
  )

  return EmailTemplate
}
