const _ = require('lodash')

_.mixin({

  parseArray (arr) {
    arr = arr || []
    return _.isArray(arr) ? arr : [arr]
  },

  parseStringToObject (str, context) {
    if (_.isString(str)) {
      const regex = new RegExp(/^{[a-zA-Z_.]*}$/g),
        matches = str.match(regex)
      if (matches) {
        const path = matches[0].substr(1, matches[0].length - 2)
        return _.get(context, path)
      }
    }
  },

  parseStringValues (str, context) {
    if (_.isString(str)) {
      const regex = new RegExp(/{{[a-zA-Z_.]*}}/g),
        matches = str.match(regex)
      return _.reduce(matches, (memo, match) => {
        const path = match.substr(2, match.length - 4)
        return memo.replace(match, _.get(context, path))
      }, str)
    }
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
