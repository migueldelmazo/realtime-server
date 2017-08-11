const _ = require('lodash'),
  realtimeServer = require('../src/index')

module.exports = {

  registerTasks () {
    realtimeServer.registerTask({
      name: 'response.sendData',
      run () {
        const body = _.get(this, 'resData.body', {}),
          status = _.get(this, 'resData.status', 200)
        this.res.status(status).send(body)
      }
    })

    realtimeServer.registerTask({
      name: 'response.handleError',
      promiseCatch: true,
      resultPath: 'resData',
      run (err) {
        return {
          body: {
            debug: _.omit(this, ['req', 'res']),
            reason: _.get(err, 'reason', '')
          },
          status: _.get(err, 'status', 200)
        }
      }
    })
  }

}
