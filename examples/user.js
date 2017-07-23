const realtimeServer = require('../src')

module.exports = {

  addLogin () {

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
          }, 2000)
        })
      }
    })

    realtimeServer.registerEnpoint({
      method: 'get',
      url: '/user/login',
      tasks: [
        { name: 'user.responseLogin' }
      ]
    })
  }

}

