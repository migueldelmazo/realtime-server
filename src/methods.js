const _ = require('lodash'),
  logger = require('./logger'),
  methodsList = {}

module.exports = {

  add (name, fn) {
    methodsList[name] = fn
  },

  isValid (name, fn) {
    if (_.isEmpty(name)) {
      logger.err('method.name is empty')
      return false
    } else if (!_.isFunction(fn)) {
      logger.err('method.fn is not function')
      return false
    }
    return true
  },

  log () {
    logger.log('methods', methodsList)
  }

}
