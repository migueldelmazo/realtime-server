const _ = require('lodash'),
  realtimeServer = require('../src/index')

module.exports = {

  registerMethods () {
    realtimeServer.registerMethod('validate.isEmail', (value) => {
      return value === 'info@migueldelmazo.com'
    })

    realtimeServer.registerMethod('validate.isNotEmpty', (value) => {
      return !_.isEmpty(value)
    })
  },

  registerTasks () {
    realtimeServer.registerTask({
      name: 'validate',
      run () {
        return new Promise((resolve, reject) => {
          const isValid = realtimeServer.runMethod(this.currentTask.validator, arguments)
          if (isValid) {
            resolve()
          } else {
            reject({
              error: {
                code: 'validate',
                description: _.get(this, 'currentTask.description', '')
              },
              status: 403
            })
          }
        })
      }
    })
  }

}
