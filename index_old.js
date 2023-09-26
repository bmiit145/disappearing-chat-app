const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

const messages = [];

io.on('connection', (socket) => {
  socket.on('message', (message) => {
    messages.push({ content: message, timestamp: Date.now() });

    // Broadcast the received message to all connected clients
    io.emit('message', message);

    // Schedule the message to be deleted after 4  seconds
    setTimeout(() => {
      const index = messages.findIndex((msg) => msg.content === message);
      if (index !== -1) {
        messages.splice(index, 1);
        io.emit('deleteMessage', message);
      }
    }, 4 * 1000); 
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
