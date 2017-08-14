const _ = require('lodash'),
  server = require('../server')

module.exports = {

  registerTasks () {
    server.registerTask({
      name: 'response.sendData',
      run () {
        const body = _.get(this, 'resData.body', {}),
          status = _.get(this, 'resData.status', 200)
        this.res.status(status).send(body)
      }
    })

    server.registerTask({
      name: 'response.handleError',
      promiseCatch: true,
      resultPath: 'resData',
      run (err) {
        return {
          body: {
            error: _.get(err, 'error', {}),
            debug: _.omit(this, ['req', 'res'])
          },
          status: _.get(err, 'status', 200)
        }
      }
    })
  }

}
