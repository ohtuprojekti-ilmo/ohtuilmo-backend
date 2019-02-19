/**
 * This seed file inserts a registration management line for testing frontend redirects
 */

'use strict'

module.exports = {
  up: async (query) => {
    await query.bulkInsert(
      'registration_managements',
      [
        {
          project_registration_open: true,
          project_registration_message: '',
          project_registration_info:
            'Project registration open until DD.MM.YYYY.',
          topic_registration_open: false,
          topic_registration_message:
            'Topic registration will open DD.MM.YYYY.',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
  },

  down: async (query) => {
    await query.bulkDelete('registration_managements', {})
  }
}
