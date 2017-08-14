const util = require('util')

module.exports = {

  err (...args) {
    console.error('ERR', args)
  },

  log (...args) {
    console.log('LOG', args)
  }

}
