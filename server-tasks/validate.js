const _ = require('lodash'),
  server = require('../server')

module.exports = {

  registerMethods () {
    server.registerMethod('validate.isEmail', (value) => {
      return value === 'info@migueldelmazo.com'
    })

    server.registerMethod('validate.isNotEmpty', (value) => {
      return !_.isEmpty(value)
    })
  },

  registerTasks () {
    server.registerTask({
      name: 'validate',
      run (...args) {
        return new Promise((resolve, reject) => {
          const isValid = server.runMethod(this.tasks.current.validator, ...args)
          if (isValid) {
            resolve()
          } else {
            reject({
              error: {
                code: 'validate',
                description: _.get(this, 'tasks.current.description', '')
              },
              status: 403
            })
          }
        })
      }
    })
  }

}
