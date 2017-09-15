const _ = require('lodash'),
  logger = require('./logger'),
  methods = require('./methods'),

  // promise handlers

  taskCatchStart = (payload, task, result) => {
    setRejectedError(payload, result)
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
    console.log(_.get(payload, 'resData.status'), _.get(payload, 'resData.body'));
  },

  // run

  runTask = (payload, ...args) => {
    const parsedParams = runTaskGetParams(payload),
      methodParams = [].concat(args, parsedParams)
    payload.tasks.current.parsedParams = parsedParams
    return methods.run.call(payload, payload.tasks.current.run, ...methodParams)
  },

  runTaskGetParams = (payload) => {
    const params = _.parseArray(payload.tasks.current.params)
    return _.map(params, (param) => {
      const obj = _.parseStringToObject(param, payload)
      param = obj === undefined ? param : obj
      return _.isString(param) ? _.parseStringValues(param, payload) : param
    })
  },

  // helpers

  isCurrentTask = (payload, task) => {
    return payload.tasks.current === task
  },

  isValidTask = (task) => {
    return !_.isEmpty(task) && _.isString(task.name)
  },

  parsePayload = (payload, tasks) => {
    payload = payload || {}
    payload.tasks = parseTasks(tasks)
  },

  parseTasks = (tasks) => {
    return _.map(tasks, (task) => {
      return _.isEmpty(list[task.name])
        ? task
        : _.defaults(task, list[task.name])
    })
  },

  setCurrentTask = (payload, task) => {
    payload.tasks.current = task
  },

  setStatusTask = (payload, status) => {
    payload.tasks.current.status = status
  },

  setRejectedError = (payload, err) => {
    if (_.isError(err)) {
      payload.tasks.errors = _.parseArray(payload.tasks.errors)
      payload.tasks.errors.push({
        current: payload.tasks.current,
        errorMessage: err.message,
        errorStack: _.stack()
      })
    }
  },

  setResultTask = (payload, result) => {
    result = _.cloneDeep(result)
    payload.tasks.current.result = result
    if (payload.tasks.current.resultPath) {
      _.set(payload, payload.tasks.current.resultPath, result)
    }
  },

  list = {}

module.exports = {

  list,

  getPromise (tasks, payload) {
    let promise = new Promise((resolve) => resolve())
    parsePayload(payload, tasks)
    _.each(payload.tasks, (task) => {
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

  register (task) {
    if (isValidTask(task)) {
      list[task.name] = task
    } else {
      logger.err('invalid task', task)
    }
  }

}
