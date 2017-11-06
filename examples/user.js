const server = require('../server')

server.registerEnpoint({
  method: 'get',
  url: '/user/login'
},
[
  {
    name: 'request.getData'
  },
  {
    name: 'validate',
    description: 'Email can not be empty',
    params: '{{reqData.query.email}}',
    validator: 'validate.isNotEmpty'
  },
  {
    name: 'validate',
    description: 'The email is not in the correct format',
    params: '{{reqData.query.email}}',
    validator: 'validate.isEmail'
  },
  {
    name: 'validate',
    description: 'Password can not be empty',
    params: '{{reqData.query.password}}',
    validator: 'validate.isNotEmpty'
  },
  {
    name: 'mysql.query',
    params: 'SELECT * FROM users WHERE email="{{reqData.query.email}}" AND password="{{reqData.query.password}}"',
    resultPath: 'user'
  },
  {
    name: 'utils.copy',
    params: { 'resData.body': 'user' }
  },
  {
    name: 'utils.set',
    params: ['resData.status', 200]
  },
  {
    name: 'response.handleError'
  },
  {
    name: 'response.sendData'
  },
  {
    name: 'realtime.send',
    params: '{user}'
  }
])
