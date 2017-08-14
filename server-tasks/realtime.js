const http = require('http'),
  server = require('../server')

module.exports = {

  registerTasks () {
    server.registerTask({
      name: 'realtime.send',
      run (body) {
        const bodyString = JSON.stringify({ body: body }),
          req = http.request({
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': bodyString.length
            },
            hostname: 'localhost',
            method: 'post',
            port: '8091',
            path: '/data'
          })
        req.write(bodyString)
        req.end()
      }
    })
  }

}
