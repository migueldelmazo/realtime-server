process.stdout.write('\033c')

const realtimeServer = require('../src'),
  user = require('./user')

user.addLogin()

realtimeServer.start('8080')
