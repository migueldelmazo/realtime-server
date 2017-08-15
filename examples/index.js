process.stdout.write('\033c')

const http = require('http'),
  realtime = require('../realtime'),
  server = require('../server'),
  mysqlTasks = require('../server-tasks/mysql'),
  realtimeTasks = require('../server-tasks/realtime'),
  resquestTasks = require('../server-tasks/request'),
  responseTasks = require('../server-tasks/response'),
  validateTasks = require('../server-tasks/validate'),
  utilsTasks = require('../server-tasks/utils'),
  user = require('./user')

// server tasks
mysqlTasks.registerTasks()
realtimeTasks.registerTasks()
resquestTasks.registerTasks()
responseTasks.registerTasks()
validateTasks.registerMethods()
utilsTasks.registerTasks()

// server methods
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
    path: '/user/login?email=info@migueldelmazo.com&password=12345678'
  }).end()
}, 500)
