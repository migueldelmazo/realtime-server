var socket = io.connect('http://localhost:8091')
socket.on('news', function (data) {
  console.log(data)
});
