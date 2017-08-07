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

  endpointCatch = (payload, err) => {
    logger.err('payload error', err)
  },

  endpointThen = (payload) => {
    logger.log('payload', _.omit(payload, ['req', 'res']))
  },

  // methods

  methodList = {},

  methodIsValid = (name, func) => {
    return _.isString(name) && _.isFunction(func)
  },

  // promise

  promiseGet = (payload) => {
    let promise = new Promise((resolve) => resolve())
    _.each(payload.endpoint.tasks, (task) => {
      if (task.catch) {
        promise = promise.catch(taskCatchStart.bind(null, payload, task))
        promise = promise.then(taskCatchEnd.bind(null, payload, task))
      } else {
        promise = promise.then(taskThenStart.bind(null, payload, task))
        promise = promise.then(taskThenEnd.bind(null, payload, task))
      }
    })
    promise = promise.then(endpointThen.bind(null, payload))
    promise = promise.catch(endpointCatch.bind(null, payload))
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

  taskCatchStart = (payload, task, result) => {
    taskSetResult(payload, result)
    taskSetStatus(payload, 'rejected')
    taskSetCurrent(payload, task)
    taskSetStatus(payload, 'solving')
    return taskRun(payload, result)
  },

  taskCatchEnd = (payload, task, result) => {
    if (taskIsCurrent(payload, task)) {
      taskSetResult(payload, result)
      taskSetStatus(payload, 'rejected')
      taskSetCurrent(payload)
    }
  },

  taskThenStart = (payload, task) => {
    taskSetCurrent(payload, task)
    taskSetStatus(payload, 'solving')
    return taskRun(payload)
  },

  taskThenEnd = (payload, task, result) => {
    if (taskIsCurrent(payload, task)) {
      taskSetResult(payload, result)
      taskSetStatus(payload, 'solved')
      taskSetCurrent(payload)
    }
  },

  taskIsCurrent = (payload, task) => {
    return payload.currentTask === task
  },

  taskParseParams = (payload) => {
    return _.map(payload.currentTask.params, (param) => {
      const regex = new RegExp(/{{[a-zA-Z_.]*}}/g),
        paramMatches = param.match(regex)
      return _.reduce(paramMatches, (memo, match) => {
        const path = match.substr(2, match.length - 4)
        return memo.replace(match, _.get(payload, path))
      }, param)
    })
  },

  taskSetCurrent = (payload, task) => {
    payload.currentTask = task
  },

  taskSetStatus = (payload, status) => {
    payload.currentTask.status = status
  },

  taskSetResult = (payload, result) => {
    result = _.cloneDeep(result)
    payload.currentTask.result = result
    if (payload.currentTask.resultPath) {
      _.set(payload, payload.currentTask.resultPath, result)
    }
  },

  taskRun = (payload, ...args) => {
    const parsedParams = taskParseParams(payload),
      methodParams = [].concat(args, parsedParams)
    payload.currentTask.parsedParams = parsedParams
    return payload.currentTask.run.apply(payload, methodParams)
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

  runMethod (methodName, params) {
    return methodList[methodName].apply(null, params)
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
