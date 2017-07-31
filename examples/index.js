process.stdout.write('\033c')

const http = require('http'),
  realtimeServer = require('../src'),
  realtimeServerResquestTasks = require('../src/request-task'),
  user = require('./user')

realtimeServerResquestTasks.registerTasks()
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
