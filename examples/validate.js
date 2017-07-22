const realtimeServer = require('../src')

module.exports = {

  addMethods () {
    realtimeServer.addMethod('isEmail', (value) => {
      return value === 'info@migueldelmazo.com'
    })

    realtimeServer.addMethod('isNotEmpty', (value) => {
      return !_.isEmpty(value)
    })
  }

}

