const _ = require('lodash'),
  logger = require('./logger'),

  methodIsValid = (name, func) => {
    return _.isString(name) && _.isFunction(func)
  },

  list = {}

module.exports = {

  list,

  register (name, func) {
    if (methodIsValid(name, func)) {
      list[name] = func
    } else {
      logger.err('invalid method', name, func)
    }
  },

  run (methodName, ...args) {
    return _.isString(methodName)
      ? list[methodName].apply(this, args)
      : methodName.apply(this, args)
  }

}
