const _ = require('lodash'),
  logger = require('./logger'),

  taskList = {},

  // tasks

  taskIsValid = (task) => {
    return !_.isEmpty(task) && _.isString(task.name)
  },

  tasksCatch = (payload, err) => {
    logger.err('payload error', err)
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

  tasksThen = (payload) => {
    logger.log('payload', _.omit(payload, ['req', 'res']))
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

  taskList,

  getPromise (payload) {
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
    promise = promise.catch(tasksCatch.bind(null, payload))
    promise = promise.then(tasksThen.bind(null, payload))
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
    if (taskIsValid(task)) {
      taskList[task.name] = task
    } else {
      logger.err('invalid task', task)
    }
  }

}
