const _ = require('lodash')

_.mixin({

  parseArray (arr) {
    arr = arr || []
    return _.isArray(arr) ? arr : [arr]
  },

  stack (removeLevels = 1) {
    const stack = new Error().stack,
      stackArr = stack.split('\n')
    removeLevels = removeLevels || 1
    stackArr.splice(1, removeLevels)
    return stackArr.join('')
  },

  stringify (obj) {
    const cache = []
    return JSON.stringify(obj, function (key, value) {
      if (_.isString(value) || _.isNumber(value) || _.isBoolean(value)) {
        return value
      } else if (_.isError(value)) {
        return _.get(value, 'stack', '').replace(/\\n/g, '')
      } else if (_.isPlainObject(value) || _.isArray(value)) {
        if (cache.indexOf(value) !== -1) {
          return
        } else {
          cache.push(value)
          return value
        }
      }
    })
  }

})

module.exports = _
