const http = require('http'),
  server = require('../server')

server.registerTask({
  name: 'realtime.send',
  run (body) {
    server.runMethod('request.send', {
      body,
      hostname: 'localhost',
      method: 'post',
      port: '8091',
      path: '/data'
    })
  }
})
