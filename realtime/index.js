const _ = require('lodash'),
  bodyParser = require('body-parser'),
  app = require('express')(),
  server = require('http').Server(app),
  io = require('socket.io')(server),

  socketStart = (config) => {
    server.listen(config.socketPort)
    io.on('connection', onConnection)
  },

  onConnection = (socket) => {
    clients[socket.id] = socket
  },

  send = (clientId, data) => {
    const client = clients[clientId]
    if (client) {
      client.emit('news', data);
    }
  },

  listenData = () => {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.post('/data', (req, res) => {
      _.each(clients, (client, clientId) => {
        send(clientId, req.body)
      })
    })
  },

  clients = {}

module.exports = {

  start (config) {
    socketStart(config)
    listenData()
  }

}


