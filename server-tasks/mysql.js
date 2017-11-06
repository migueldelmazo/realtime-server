const server = require('../server')

server.registerTask({
  name: 'mysql.query',
  run (query) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          id: 1,
          name: 'Miguel del Mazo',
          email: 'info@migueldelmazo.com',
          password: '12345678'
        })
      }, 500)
    })
  }
})
