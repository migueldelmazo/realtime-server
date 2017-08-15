const _ = require('lodash'),
  logger = require('./logger'),
  tasks = require('./tasks'),

  endpointIsValid = (endpoint) => {
    return !_.isEmpty(endpoint) && _.isString(endpoint.method) && _.isString(endpoint.url)
  },

  endpointParse = (endpoint) => {
    endpoint.method = endpoint.method || 'get'
    endpoint.url = endpoint.url || ''
  },

  endpointRegister = (endpoint, tasks) => {
    list[endpoint.method + ':' + endpoint.url] = { endpoint, tasks }
  },

  endpointListen = (endpoint, endpointTasks, app) => {
    app[endpoint.method](endpoint.url, (req, res) => {
      tasks.getPromise(endpointTasks, { endpoint, req, res }).then(() => {})
    })
  },

  list = {}

module.exports = {

  list,

  register (endpoint, endpointTasks, app) {
    if (endpointIsValid(endpoint)) {
      endpointParse(endpoint)
      endpointRegister(endpoint, endpointTasks)
      endpointListen(endpoint, endpointTasks, app)
    } else {
      logger.err('invalid endpoint', endpoint)
    }
  }

}
