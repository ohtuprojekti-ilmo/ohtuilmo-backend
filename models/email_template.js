'use strict'

const replaceTopicName = (template, replacement) =>
  template.replace(/{{topicName}}/g, replacement)

module.exports = (sequelize, Sequelize) => {
  const EmailTemplate = sequelize.define(
    'email_templates',
    {
      topic_accepted_fin: Sequelize.TEXT,
      topic_rejected_fin: Sequelize.TEXT,
      topic_accepted_eng: Sequelize.TEXT,
      topic_rejected_eng: Sequelize.TEXT
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
