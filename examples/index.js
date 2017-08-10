process.stdout.write('\033c')

const http = require('http'),
  realtimeServer = require('../src'),
  realtimeServerResquestTasks = require('../tasks/request'),
  realtimeServerResponseTasks = require('../tasks/response'),
  validateTasks = require('../tasks/validate'),
  user = require('./user')

// common
realtimeServerResquestTasks.registerTasks()
realtimeServerResponseTasks.registerTasks()
validateTasks.registerMethods()
validateTasks.registerTasks()

// endpoints
user.addLogin()

// app
realtimeServer.start('8090')

setTimeout(() => {
  http.request({
    hostname: 'localhost',
    method: 'get',
    port: '8090',
    path: '/user/login?email=info@migueldelmazo.com'
  }).end()
}, 500)
