'use strict'

const replaceTopicName = (replacement) => (template) =>
  template.replace(/{{topicName}}/g, replacement)

module.exports = (sequelize, Sequelize) => {
  const EmailTemplate = sequelize.define(
    'email_templates',
    {
      topic_accepted_fin: Sequelize.TEXT,
      topic_rejected_fin: Sequelize.TEXT,
      topic_accepted_eng: Sequelize.TEXT,
      topic_rejected_eng: Sequelize.TEXT,
      customer_review_link_fin: Sequelize.TEXT,
      customer_review_link_eng: Sequelize.TEXT
    },
    {
      underscored: true
    }
  )

  EmailTemplate.prototype.render = function render(templateName, context) {
    const { topic } = context
    const template = this.getDataValue(templateName)

    return replaceTopicName(topic.content.title)(template)
  }

  return EmailTemplate
}
