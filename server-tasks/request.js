const server = require('../server')

module.exports = {

  registerTasks () {
    server.registerTask({
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
