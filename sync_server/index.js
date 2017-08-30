var server = require('http').createServer();

var makeOrigin = function (origin) {
  var str = origin + ':*' + ' ';
  str += 'http://' + origin + ':*' + ' ';
  str += 'www.' + origin + ':*' + ' ';
  str += 'http://' + 'www.' + origin + ':*' + ' ';

  return str;
}

var io = require('socket.io')(server, {
  origins: origins
});

var origins = makeOrigin('localhost:3000')

io.on('connection', function (socket) {
  console.log('connected');
  var i = 0;
  socket.on('plot-data', function (data) {
    socket.broadcast.emit('plot-data', data);
  });

  socket.on('plot-action', (action) => {
    console.log(i++);
    console.log('action');
    console.log(action);
    socket.broadcast.emit('plot-action', action);
  });

  socket.on('disconnect', function () {
    console.log('disconnected');
  });
});

server.listen(+process.env.PORT, function () {
  console.log('sync server is listening on port ' + process.env.PORT);
});
