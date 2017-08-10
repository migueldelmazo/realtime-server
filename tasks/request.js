const realtimeServer = require('../src/index')

module.exports = {

  registerTasks () {
    realtimeServer.registerTask({
      name: 'request.getData',
      resultPath: 'reqData',
      run () {
        return {
          body: this.req.body || {},
          params: this.req.params,
          query: this.req.query
        }
      }
    })
  }

}
