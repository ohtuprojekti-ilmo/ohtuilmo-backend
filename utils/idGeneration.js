
const randomstring = require('randomstring')

const getRandomId = () => {
  return randomstring.generate(8)
}

module.exports = {
  getRandomId
}