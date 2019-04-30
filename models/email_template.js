'use strict'
const { pipe } = require('../utils')

const replaceTopicName = (replacement) => (template) =>
  template.replace(/{{topicName}}/g, replacement)
const replaceSecretId = (replacement) => (template) =>
  template.replace(/{{secretId}}/g, replacement)

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

  const isCustomerReviewLinkTemplate = (str) =>
    str === 'customer_review_link_fin' || str === 'customer_review_link_eng'

  EmailTemplate.prototype.render = function render(templateName, context) {
    const { topic } = context
    const template = this.getDataValue(templateName)

    const operations = [replaceTopicName(topic.content.title)]

    if (isCustomerReviewLinkTemplate(templateName)) {
      operations.push(replaceSecretId(topic.secret_id))
    }

    return pipe(...operations)(template)
  }

  return EmailTemplate
}
