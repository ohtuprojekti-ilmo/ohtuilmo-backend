/**
 * @typedef {'topicAccepted' | 'topicRejected'} MessageType
 * @typedef {'finnish' | 'english'} MessageLanguage
 * @typedef {'topic_accepted_fin' | 'topic_accepted_eng' | 'topic_rejected_fin' | 'topic_rejected_eng'} TemplateName
 */

/**
 * @type {{[key: string]: { [key: string]: TemplateName }}}
 */
const msgTypeToDbColumn = {
  topicAccepted: {
    finnish: 'topic_accepted_fin',
    english: 'topic_accepted_eng'
  },
  topicRejected: {
    finnish: 'topic_rejected_fin',
    english: 'topic_rejected_eng'
  }
}

/**
 * @type {{[key: string]: {type: MessageType, language: MessageLanguage}}}
 */
const dbColumnToMsgType = {
  topic_accepted_fin: { type: 'topicAccepted', language: 'finnish' },
  topic_accepted_eng: { type: 'topicAccepted', language: 'english' },
  topic_rejected_fin: { type: 'topicRejected', language: 'finnish' },
  topic_rejected_eng: { type: 'topicRejected', language: 'english' }
}

/**
 * @param {MessageType} messageType
 * @param {MessageLanguage} messageLanguage
 * @returns {TemplateName}
 */
const emailTypeToTemplateName = (messageType, messageLanguage) =>
  msgTypeToDbColumn[messageType][messageLanguage]

/**
 * @param {TemplateName} templateName
 * @returns {{type: MessageType, language: MessageLanguage}}
 */
const templateNameToEmailType = (templateName) =>
  dbColumnToMsgType[templateName]

module.exports = {
  emailTypeToTemplateName,
  templateNameToEmailType
}
