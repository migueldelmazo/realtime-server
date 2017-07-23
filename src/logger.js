const util = require('util')

module.exports = {

  err (...args) {
    console.log('ERR', JSON.stringify(args[0]), JSON.stringify(args[1]));
  },

  log (...args) {
    console.log('LOG', JSON.stringify(args[0]), JSON.stringify(args[1]));
  }

}
