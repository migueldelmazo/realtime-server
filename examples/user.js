const server = require('../server')

module.exports = {

  addLogin () {

    server.registerTask({
      name: 'user.responseLogin',
      resultPath: 'resData',
      run () {
        const startTime = Date.now()
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const endTime = Date.now()
            resolve({
              body: {
                logged: true,
                startTime,
                endTime,
                duration: endTime - startTime
              },
              status: 200
            })
          }, 500)
        })
      }
    })

    server.registerEnpoint({
      method: 'get',
      url: '/user/login',
      tasks: [
        {
          name: 'request.getData'
        },
        {
          name: 'validate',
          description: 'Email can not be empty',
          params: [
            '{{reqData.query.email}}'
          ],
          validator: 'validate.isNotEmpty'
        },
        {
          name: 'validate',
          description: 'The email is not in the correct format',
          params: [
            '{{reqData.query.email}}'
          ],
          validator: 'validate.isEmail'
        },
        { name: 'user.responseLogin' },
        { name: 'response.handleError' },
        { name: 'response.sendData' },
        {
          name: 'realtime.send',
          params: ['user logged']
        }
      ]
    })
  }

}

