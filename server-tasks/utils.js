const _ = require('lodash'),
  server = require('../server')

server.registerTask({
  name: 'utils.copy',
  run (definition) {
    _.each(definition, (value, key) => {
      _.set(this, key, _.get(this, value))
    })
  }
})

server.registerTask({
  name: 'utils.set',
  run (key, value) {
    _.set(this, key, value)
  }
})
