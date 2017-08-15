const _ = require('lodash'),
  logger = require('./logger'),

  taskList = {},

  // promise handlers

  taskCatchStart = (payload, task, result) => {
    checkError(payload, result)
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
    return payload.tasks.current.run.apply(payload, methodParams)
  },

  runTaskGetParams = (payload) => {
    const params = _.parseArray(payload.tasks.current.params)
    return _.map(params, runTaskGetParamValue.bind(null, payload))
  },

  runTaskGetParamValue = (payload, param) => {
    if (_.isArray(param)) {
      return runTaskGetParamArray(payload, param)
    } else if (_.isPlainObject(param)) {
      return runTaskGetParamObject(payload, param)
    } else if (_.isString(param)) {
      return runTaskGetParamString(payload, param)
    }
    return param
  },

  runTaskGetParamArray = (payload, param) => {
    return _.map(param, runTaskGetParamValue.bind(null, payload))
  },

  runTaskGetParamObject = (payload, param) => {
    return _.reduce(param, (memo, value, key) => {
      memo[key] = runTaskGetParamValue(payload, value)
      return memo
    }, {})
  },

  runTaskGetParamString = (payload, param) => {
    const regex = new RegExp(/{{[a-zA-Z_.]*}}/g),
      paramMatches = param.match(regex)
    return _.reduce(paramMatches, (memo, match) => {
      const path = match.substr(2, match.length - 4)
      return memo.replace(match, _.get(payload, path))
    }, param)
  },

  // helpers

  parsePayload = (payload, tasks) => {
    payload.tasks = { tasks }
  },

  checkError = (payload, err) => {
    if (_.isError(err) && payload.tasks.current) {
      payload.tasks.current.err = err
    }
  }

  isCurrentTask = (payload, task) => {
    return payload.tasks.current === task
  },

  isValidTask = (task) => {
    return !_.isEmpty(task) && _.isString(task.name)
  },

  setCurrentTask = (payload, task) => {
    payload.tasks.current = task
  },

  setStatusTask = (payload, status) => {
    payload.tasks.current.status = status
  },

  setResultTask = (payload, result) => {
    result = _.cloneDeep(result)
    payload.tasks.current.result = result
    if (payload.tasks.current.resultPath) {
      _.set(payload, payload.tasks.current.resultPath, result)
    }
  }

module.exports = {

  taskList,

  getPromise (tasks, payload = {}) {
    let promise = new Promise((resolve) => resolve())
    parsePayload(payload, tasks)
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
