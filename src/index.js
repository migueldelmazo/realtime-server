const _ = require('lodash'),
  bodyParser = require('body-parser'),
  express = require('express'),
  actions = require('./actions'),
  endpoints = require('./endpoints'),
  logger = require('./logger'),
  methods = require('./methods'),

  app = express()

module.exports = {

  // express

  start (port) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.listen(port, () => {
      logger.log('express start:', port)
    })
  },

  // actions

  addAction (action) {
    if (actions.isValid(action)) {
      actions.add(action)
    }
  },

  logActions () {
    actions.log()
  },

  // endpoints

  addEnpoint (_endpoint) {
    if (endpoints.isValid(_endpoint)) {
      const endpoint = endpoints.parse(_endpoint)
      endpoint.actions = actions.parseActions(_endpoint.actions)
      app[endpoint.method](endpoint.url, (req, res) => {
        actions.getPromise({ endpoint, req, res }).then(() => {})
      })
      endpoints.add(endpoint)
    }
  },

  logEndpoints () {
    endpoints.log()
  },

  // methods

  addMethod (name, fn) {
    if (methods.isValid(name, fn)) {
      methods.add(name, fn)
    }
  },

  logMethods () {
    methods.log()
  }

}
