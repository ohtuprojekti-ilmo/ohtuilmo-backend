
const randomstring = require('randomstring')

const getRandomId = () => {
  return ('a' + randomstring.generate(16))
}

module.exports = {
  getRandomId
}