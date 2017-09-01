process.stdout.write('\033c')

const realtime = require('../realtime'),
  server = require('../server'),
  mysqlHelpers = require('../server-tasks/mysql'),
  realtimeHelpers = require('../server-tasks/realtime'),
  requestHelpers = require('../server-tasks/request'),
  responseHelpers = require('../server-tasks/response'),
  validateHelpers = require('../server-tasks/validate'),
  utilsHelpers = require('../server-tasks/utils'),
  userEndpoint = require('./user')

// server methods
requestHelpers.registerMethods()
validateHelpers.registerMethods()

// server tasks
mysqlHelpers.registerTasks()
realtimeHelpers.registerTasks()
requestHelpers.registerTasks()
responseHelpers.registerTasks()
utilsHelpers.registerTasks()
validateHelpers.registerTasks()

// server endpoints
userEndpoint.addLogin()

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
