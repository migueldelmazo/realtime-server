process.stdout.write('\033c')

const realtime = require('../realtime'),
  server = require('../server')

// register config, methods and tasks
require('../server-tasks/mysql')
require('../server-tasks/realtime')
require('../server-tasks/request')
require('../server-tasks/response')
require('../server-tasks/utils')
require('../server-tasks/validate')

// server endpoints
require('./user')

// config: realtime
realtime.start({
  socketPort: '8091'
})

// config: server
server.start({
  serverPort: '8090',
  serverStaticDir: 'public'
})

// fake
setTimeout(() => {
  server.runMethod('request.send', {
    hostname: 'localhost',
    method: 'get',
    port: '8090',
    path: '/user/login?email=info@migueldelmazo.com&password=12345678'
  })
}, 500)
