process.stdout.write('\033c')

const http = require('http'),
  realtimeServer = require('../src'),
  realtimeServerResquestTasks = require('../src/request-tasks'),
  realtimeServerResponseTasks = require('../src/response-tasks'),
  validateTasks = require('../src/validate-tasks'),
  user = require('./user')

// common
realtimeServerResquestTasks.registerTasks()
realtimeServerResponseTasks.registerTasks()
validateTasks.registerMethods()
validateTasks.registerTasks()

// app
user.addLogin()

realtimeServer.start('8080')

setTimeout(() => {
  http.request({
    hostname: 'localhost',
    method: 'get',
    port: '8080',
    path: '/user/login?email=info@migueldelmazo.com'
  }).end()
}, 500)
