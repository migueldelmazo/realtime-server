process.stdout.write('\033c')

const http = require('http'),
  server = require('../server'),
  serverResquestTasks = require('../server-tasks/request'),
  serverResponseTasks = require('../server-tasks/response'),
  validateTasks = require('../server-tasks/validate'),
  user = require('./user')

// common
serverResquestTasks.registerTasks()
serverResponseTasks.registerTasks()
validateTasks.registerMethods()
validateTasks.registerTasks()

// endpoints
user.addLogin()

// app
server.start({
  port: '8090',
  staticDir: 'public'
})

setTimeout(() => {
  http.request({
    hostname: 'localhost',
    method: 'get',
    port: '8090',
    path: '/user/login?email=info@migueldelmazo.com'
  }).end()
}, 500)
