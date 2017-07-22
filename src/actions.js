const _ = require('lodash'),
  logger = require('./logger'),

  onHandleAction = (endpoint, action, result) => {
    return action.run(endpoint, action, result)
  },

  actionsList = {}

module.exports = {

  add (action) {
    actionsList[action.name] = action
  },

  getPromise (endpoint) {
    let promise = new Promise((resolve) => resolve())
    _.each(endpoint.endpoint.actions, (action) => {
      promise = promise.then(onHandleAction.bind(null, endpoint, action))
    })
    return promise
  },

  isValid (action) {
    if (_.isEmpty(action)) {
      logger.err('action is empty')
      return false
    } else if (_.isEmpty(action.name)) {
      logger.err('action.name is empty')
      return false
    }
    return true
  },

  log () {
    logger.log('actions', actionsList)
  },

  parseActions (actions) {
    return _.map(actions, (action) => {
      if (_.isEmpty(actionsList[action.name])) {
        logger.err('action does not exist', action.name)
      }
      return actionsList[action.name]
    })
  }

}
