process.stdout.write('\033c')

const realtimeServer = require('../src'),
  user = require('./user')

user.addLogin()

realtimeServer.logActions()
realtimeServer.logMethods()
realtimeServer.logEndpoints()

realtimeServer.start('8080')
