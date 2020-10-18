const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.set('port', 3000);
app.use('/static', express.static(__dirname + '/static'));
app.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(3000, () => {
  console.log('Starting server on port 3000');
});

const players = {};

// add the websocket connector
io.on('connection', (socket) => {
  // disconnected players
  socket.on('disconnect', () => {
    delete players[socket.id];
  });

  socket.on('new player', () => {
    players[socket.id] = {
      x: 300,
      y: 300
    };
  });

  socket.on('movement', ({left, right, up, down}) => {
    const player = players[socket.id] || {};
    if (left) {
      player.x -= 5;
    }
    if (up) {
      player.y -= 5;
    }
    if (right) {
      player.x += 5;
    }
    if (down) {
      player.y += 5;
    }
  })
});

// 60 tps
setInterval(() => {
  io.sockets.emit('state', players);
}, 1000 / 60);
