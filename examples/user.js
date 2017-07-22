const realtimeServer = require('../src')

module.exports = {

  addLogin () {

    realtimeServer.addAction({
      name: 'user.responseLogin',
      run (endpoint, action, result) {
        const startTime = Date.now()
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const endTime = Date.now()
            endpoint.res.send({
              logged: true,
              startTime,
              endTime,
              duration: endTime - startTime
            }).status(200)
          }, 2000)
        })
      }
    })

    realtimeServer.addEnpoint({
      method: 'get',
      url: '/user/login',
      actions: [
        { name: 'user.responseLogin' }
      ]
    })
  }

}

