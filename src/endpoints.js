const _ = require('lodash'),
  logger = require('./logger'),
  endpointList = {}

module.exports = {

  add (endpoint) {
    endpointList[endpoint.method + ':' + endpoint.url] = endpoint
  },

  getRequestData (req) {
    return {
      body: req.body || {},
      params: req.params,
      query: req.query
    }
  },

  isValid (endpoint) {
    if (_.isEmpty(endpoint)) {
      logger.err('endpoint is empty', endpoint)
      return false
    } else if (!_.isString(endpoint.method)) {
      logger.err('endpoint.method is not string', endpoint)
      return false
    } else if (!_.includes(['get', 'post'], endpoint.method)) {
      logger.err('endpoint.method is empty', endpoint)
      return false
    } else if (_.isEmpty(endpoint.url)) {
      logger.err('endpoint.url is empty', endpoint)
      return false
    } else if (!_.isString(endpoint.url)) {
      logger.err('endpoint.url is not string', endpoint)
      return false
    }
    return true
  },

  log () {
    logger.log('endpoints', endpointList)
  },

  parse (_endpoint) {
    const endpoint = {}
    endpoint.method = _endpoint.method
    endpoint.options = _endpoint.options || {}
    endpoint.url = _endpoint.url
    return endpoint
  }

}
