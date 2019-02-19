'use strict'

/**
 * This seed adds normal user and admin user for e2e
 * testing page access in frontend.
 */

module.exports = {
  up: async (query) => {
    await query.bulkInsert(
      'users',
      [
        {
          student_number: '012345678',
          username: 'testertester',
          first_names: 'Timo *Teppo Tellervo',
          last_name: 'Testaaja',
          email: '',
          admin: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          student_number: '012345688',
          username: 'testertester2',
          first_names: 'Angela',
          last_name: 'Merkel',
          email: '',
          admin: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
  },

  down: async (query) => {
    await query.bulkDelete('users', null, {})
  }
}
