const _ = require('lodash'),
  bodyParser = require('body-parser'),
  express = require('express'),
  logger = require('./logger'),
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

  // req

  requestGetData = (req) => {
    return {
      body: req.body || {},
      params: req.params,
      query: req.query
    }
  },

  requestParse = (req, res, endpoint) => {
    return {
      endpoint,
      payload: {},
      reqData: requestGetData(req),
      res
    }
  },

  // tasks

  taskList = {},

  taskGetPromise = (request) => {
    let promise = new Promise((resolve) => resolve())
    _.each(request.endpoint.tasks, (task) => {
      promise = promise.then(taskHandler.bind(null, request, task))
    })
    return promise
  },

  taskHandler = (request, task) => {
    request.currentTask = task
    task.run.call(request)
  },

  taskIsValid = (task) => {
    return !_.isEmpty(task) && _.isString(task.name)
  },

  tasksParse = (tasks) => {
    return _.map(tasks, (task) => {
      if (_.isEmpty(taskList[task.name])) {
        return task
      } else {
        return _.defaults(task, taskList[task.name])
      }
    })
  }

module.exports = {

  // express

  start (port) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.listen(port, () => {
      logger.log('endpoints', endpointList)
      logger.log('methods', methodList)
      logger.log('tasks', taskList)
      logger.log('express start:', port)
    })
  },

  // endpoints

  registerEnpoint (endpoint) {
    if (endpointIsValid(endpoint)) {
      const parsedEndpoint = endpointParse(endpoint)
      parsedEndpoint.tasks = tasksParse(endpoint.tasks)
      app[endpoint.method](endpoint.url, (req, res) => {
        const request = requestParse(req, res, endpoint)
        taskGetPromise(request).then(() => {})
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

  // task

  registerTask (task) {
    if (taskIsValid(task)) {
      taskList[task.name] = task
    } else {
      logger.err('invalid task', task)
    }
  }

}
