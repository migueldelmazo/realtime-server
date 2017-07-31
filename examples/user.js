const realtimeServer = require('../src')

module.exports = {

  addLogin () {

    realtimeServer.registerTask({
      name: 'validate',
      run () {
        return 123
      }
    })

    realtimeServer.registerTask({
      name: 'user.responseLogin',
      run () {
        const startTime = Date.now()
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const endTime = Date.now()
            this.res.send({
              logged: true,
              startTime,
              endTime,
              duration: endTime - startTime
            }).status(200)
            resolve()
          }, 500)
        })
      }
    })

    realtimeServer.registerEnpoint({
      method: 'get',
      url: '/user/login',
      tasks: [
        {
          name: 'request.getData'
        },
        {
          name: 'validate',
          params: [
            '{{reqData.query.email}}'
          ]
        },
        {
          name: 'user.responseLogin'
        }
      ]
    })
  }

}

