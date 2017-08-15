const _ = require('./lodash'),
  bodyParser = require('body-parser'),
  express = require('express'),
  path = require('path'),
  logger = require('./logger'),
  tasks = require('./tasks'),
  app = express(),

  // endpoints

  endpointList = {},

  endpointIsValid = (endpoint) => {
    return !_.isEmpty(endpoint) && _.isString(endpoint.method) && _.isString(endpoint.url)
  },

  endpointParse = (endpoint) => {
    return {
      method: endpoint.method,
      options: endpoint.options || {},
      url: endpoint.url
    }
  },

  endpointRegister = (endpoint) => {
    endpointList[endpoint.method + ':' + endpoint.url] = endpoint
  },

  // methods

  methodList = {},

  methodIsValid = (name, func) => {
    return _.isString(name) && _.isFunction(func)
  },

  // server

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
      logger.log('endpoints', endpointList)
      logger.log('methods', methodList)
      logger.log('tasks', tasks.taskList)
      logger.log('express start', config.serverPort)
    })
  }

module.exports = {

  // express

  start (config) {
    serverBodyParser()
    serverStatic(config)
    serverStart(config)
  },

  // endpoints

  registerEnpoint (_endpoint) {
    if (endpointIsValid(_endpoint)) {
      const endpoint = endpointParse(_endpoint)
      endpoint.tasks = tasks.parseTasks(_endpoint.tasks)
      app[endpoint.method](endpoint.url, (req, res) => {
        tasks.getPromise(endpoint.tasks, {
          endpoint: _.omit(endpoint, ['tasks']),
          req,
          res
        }).then(() => {})
      })
      endpointRegister(endpoint)
    } else {
      logger.err('invalid endpoint', endpoint)
    }
  },

  // method

  registerMethod (name, func) {
    if (methodIsValid(name, func)) {
      methodList[name] = func
    } else {
      logger.err('invalid method', name, func)
    }
  },

  runMethod (methodName, params) {
    return methodList[methodName].apply(null, params)
  },

  // task

  registerTask (task) {
    tasks.registerTask(task)
  }

}
