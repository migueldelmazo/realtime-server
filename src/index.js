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

  endpointCatch = (request) => {
    logger.log('request error', _.omit(request, ['req', 'res']))
  },

  endpointThen = (request) => {
    logger.log('request', _.omit(request, ['req', 'res']))
  },

  // methods

  methodList = {},

  methodIsValid = (name, func) => {
    return _.isString(name) && _.isFunction(func)
  },

  // promise

  promiseGet = (request) => {
    let promise = new Promise((resolve) => resolve())
    _.each(request.endpoint.tasks, (task) => {
      if (task.catch) {
        promise = promise.catch(taskCatch.bind(null, request, task))
      } else {
        promise = promise.then(taskThenStart.bind(null, request, task))
        promise = promise.then(taskThenEnd.bind(null, request, task))
      }
    })
    promise = promise.then(endpointThen.bind(null, request))
    promise = promise.catch(endpointCatch.bind(null, request))
    return promise
  },

  // tasks

  taskList = {},

  taskIsValid = (task) => {
    return !_.isEmpty(task) && _.isString(task.name)
  },

  tasksParse = (tasks) => {
    return _.map(tasks, (task) => {
      return _.isEmpty(taskList[task.name])
        ? task
        : _.defaults(task, taskList[task.name])
    })
  },

  taskThenStart = (request, task) => {
    request.currentTask = task
    task.parsedParams = taskParseParams(request, task)
    return task.run.apply(request, task.parsedParams)
  },

  taskThenEnd = (request, task, result) => {
    taskSetResult(request, task, result)
    request.currentTask = undefined
  },

  taskCatch = (request, task) => {
    logger.log('request error', _.omit(request, ['req', 'res']))
  },

  taskParseParams = (request, task) => {
    return _.map(task.params, (param) => {
      const regex = new RegExp(/{{[a-zA-Z_.]*}}/g)
      return _.reduce(param.match(regex), (memo, match) => {
        const path = match.substr(2, match.length - 4)
        return memo.replace(match, _.get(request, path))
      }, param)
    })
  },

  taskSetResult = (request, task, result) => {
    task.result = result
    if (task.resultPath) {
      _.set(request, task.resultPath, result)
    }
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
      logger.log('express start', port)
    })
  },

  // endpoints

  registerEnpoint (endpoint) {
    if (endpointIsValid(endpoint)) {
      const parsedEndpoint = endpointParse(endpoint)
      parsedEndpoint.tasks = tasksParse(endpoint.tasks)
      app[endpoint.method](endpoint.url, (req, res) => {
        promiseGet({ req, res, endpoint }).then(() => {})
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
