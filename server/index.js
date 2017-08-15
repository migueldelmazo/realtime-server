const _ = require('./lodash'),
  bodyParser = require('body-parser'),
  express = require('express'),
  path = require('path'),
  logger = require('./logger'),
  endpoints = require('./endpoints'),
  methods = require('./methods'),
  tasks = require('./tasks'),
  app = express(),

  serverBodyParser = () => {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
  },

  serverStatic = (config) => {
    if (config.serverStaticDir) {
      app.use(express.static(path.join(__dirname, '../', config.serverStaticDir)));
    }
  },

  serverStart = (config) => {
    app.listen(config.serverPort, () => {
      logger.log('realtime server', config.serverPort, {
        endpoints: endpoints.list,
        methods: methods.list,
        tasks: tasks.list
      })
    })
  }

module.exports = {

  start (config) {
    serverBodyParser()
    serverStatic(config)
    serverStart(config)
  },

  registerEnpoint (endpoint, tasks) {
    endpoints.register(endpoint, tasks, app)
  },

  registerMethod: methods.register,
  registerTask: tasks.register,
  runMethod: methods.run

}
