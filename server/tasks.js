const _ = require('lodash'),
  logger = require('./logger'),

  taskList = {},

  // promise handlers

  taskCatchStart = (payload, task, result) => {
    setResultTask(payload, result)
    setStatusTask(payload, 'rejected')
    setCurrentTask(payload, task)
    setStatusTask(payload, 'solving')
    return runTask(payload, result)
  },

  taskCatchEnd = (payload, task, result) => {
    if (isCurrentTask(payload, task)) {
      setResultTask(payload, result)
      setStatusTask(payload, 'rejected')
      setCurrentTask(payload)
    }
  },

  taskThenStart = (payload, task) => {
    setCurrentTask(payload, task)
    setStatusTask(payload, 'solving')
    return runTask(payload)
  },

  taskThenEnd = (payload, task, result) => {
    if (isCurrentTask(payload, task)) {
      setResultTask(payload, result)
      setStatusTask(payload, 'solved')
      setCurrentTask(payload)
    }
  },

  promiseCatch = (payload, err) => {
    logger.err('payload error', err)
  },

  promiseThen = (payload) => {
    logger.log('payload', _.omit(payload, ['req', 'res']))
  },

  // helpers

  isCurrentTask = (payload, task) => {
    return payload.currentTask === task
  },

  isValidTask = (task) => {
    return !_.isEmpty(task) && _.isString(task.name)
  },

  setCurrentTask = (payload, task) => {
    payload.currentTask = task
  },

  setStatusTask = (payload, status) => {
    payload.currentTask.status = status
  },

  setResultTask = (payload, result) => {
    result = _.cloneDeep(result)
    payload.currentTask.result = result
    if (payload.currentTask.resultPath) {
      _.set(payload, payload.currentTask.resultPath, result)
    }
  },

  runTask = (payload, ...args) => {
    const parsedParams = runTaskGetParams(payload),
      methodParams = [].concat(args, parsedParams)
    payload.currentTask.parsedParams = parsedParams
    return payload.currentTask.run.apply(payload, methodParams)
  },

  runTaskGetParams = (payload) => {
    return _.map(payload.currentTask.params, (param) => {
      const regex = new RegExp(/{{[a-zA-Z_.]*}}/g),
        paramMatches = param.match(regex)
      return _.reduce(paramMatches, (memo, match) => {
        const path = match.substr(2, match.length - 4)
        return memo.replace(match, _.get(payload, path))
      }, param)
    })
  }

module.exports = {

  taskList,

  getPromise (tasks, payload = {}) {
    let promise = new Promise((resolve) => resolve())
    _.each(tasks, (task) => {
      if (task.promiseCatch) {
        promise = promise.catch(taskCatchStart.bind(null, payload, task))
        promise = promise.then(taskCatchEnd.bind(null, payload, task))
      } else {
        promise = promise.then(taskThenStart.bind(null, payload, task))
        promise = promise.then(taskThenEnd.bind(null, payload, task))
      }
    })
    promise = promise.catch(promiseCatch.bind(null, payload))
    promise = promise.then(promiseThen.bind(null, payload))
    return promise
  },

  parseTasks (tasks) {
    return _.map(tasks, (task) => {
      return _.isEmpty(taskList[task.name])
        ? task
        : _.defaults(task, taskList[task.name])
    })
  },

  registerTask (task) {
    if (isValidTask(task)) {
      taskList[task.name] = task
    } else {
      logger.err('invalid task', task)
    }
  }

}
