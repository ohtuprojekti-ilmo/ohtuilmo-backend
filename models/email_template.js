'use strict'

const replaceTopicName = (template, replacement) =>
  template.replace(/{{topicName}}/g, replacement)

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

  EmailTemplate.prototype.render = function render(templateName, context) {
    const template = this.getDataValue(templateName)
    const { topicName } = context
    return replaceTopicName(template, topicName)
  }

  return EmailTemplate
}
