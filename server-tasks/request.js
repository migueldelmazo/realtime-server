const _ = require('lodash'),
  http = require('http'),
  https = require('https'),
  server = require('../server'),

  // send: request

  sendParseDataEndpoint = (endpoint, resolve, reject) => {
    // method
    endpoint.method = (endpoint.method || 'GET').toUpperCase()
    // protocol
    endpoint.protocol = endpoint.protocol || 'http'
    // hostname
    endpoint.hostname = endpoint.hostname || ''
    // port
    endpoint.port = endpoint.port || ''
    // path
    endpoint.path = endpoint.path || '/'
    // body
    endpoint.stringBody = _.isEmpty(endpoint.body) ? '' : _.stringify(endpoint.body)
    // headers
    endpoint.headers = _.omitBy(endpoint.headers, _.isUndefined);
    endpoint.headers = _.defaults({ 'Content-Type': 'application/json' }, endpoint.headers);
    if (['POST', 'PATCH', 'PUT'].indexOf(endpoint.method) >= 0) {
      endpoint.headers['Content-Length'] = endpoint.stringBody.length;
    }
    // response
    endpoint.responseData = ''
    // promise
    endpoint.resolve = resolve
    endpoint.reject = reject
  },

  sendGetRequest = (endpoint) => {
    const handler = endpoint.protocol === 'http' ? http : https
    return handler.request({
      headers: endpoint.headers,
      hostname: endpoint.hostname,
      method: endpoint.method,
      path: endpoint.path,
      port: endpoint.port
    }, sendHandleResponse.bind(null, endpoint))
  },

  sendListenError = (request, endpoint) => {
    request.on('error', (err) => endpoint.reject(err))
  },

  sendWriteBody = (request, endpoint) => {
    if (endpoint.stringBody) {
      request.write(endpoint.stringBody);
    }
  },

  // send: response

  sendHandleResponse = (endpoint, response) => {
    endpoint.response = response
    response.setEncoding('utf8')
    response.on('data', sendResponseOnData.bind(null, endpoint))
    response.on('end', sendResponseOnEnd.bind(null, endpoint))
  },

  sendResponseOnData = (endpoint, chunk) => {
    endpoint.responseData += chunk
  },

  sendResponseOnEnd = (endpoint) => {
    try {
      endpoint.resolve({
        data: JSON.parse(endpoint.responseData || '{}'),
        status: endpoint.response.statusCode
      })
    } catch (err) {
      endpoint.reject(err)
    }
  }

module.exports = {


  registerMethods () {
    server.registerMethod('request.send', (endpoint) => {
      return new Promise((resolve, reject) => {
        sendParseDataEndpoint(endpoint, resolve, reject)
        const request = sendGetRequest(endpoint)
        sendListenError(request, endpoint)
        sendWriteBody(request, endpoint)
        request.end()
      })
    })
  },

  registerTasks () {
    server.registerTask({
      name: 'request.getData',
      resultPath: 'reqData',
      run () {
        return {
          body: this.req.body || {},
          params: this.req.params,
          query: this.req.query
        }
      }
    })

    server.registerTask({
      name: 'request.send',
      run: 'request.send'
    })
  }

}
