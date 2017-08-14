process.stdout.write('\033c')

const http = require('http'),
  realtime = require('../realtime'),
  server = require('../server'),
  serverRealtimeTasks = require('../server-tasks/realtime'),
  serverResquestTasks = require('../server-tasks/request'),
  serverResponseTasks = require('../server-tasks/response'),
  validateTasks = require('../server-tasks/validate'),
  user = require('./user')

// server common
serverRealtimeTasks.registerTasks()
serverResquestTasks.registerTasks()
serverResponseTasks.registerTasks()
validateTasks.registerMethods()
validateTasks.registerTasks()

// server endpoints
user.addLogin()

// realtime
realtime.start({
  socketPort: '8091'
})

// server
server.start({
  serverPort: '8090',
  serverStaticDir: 'public'
})

setTimeout(() => {
  http.request({
    hostname: 'localhost',
    method: 'get',
    port: '8090',
    path: '/user/login?email=info@migueldelmazo.com'
  }).end()
}, 500)
