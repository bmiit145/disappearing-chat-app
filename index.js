const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Store connected socket clients
const clientsByToken = new Map();

io.on('connection', (socket) => {
  socket.on('login', (userToken) => {
    // Create or get a list for users with the same token
    if (!clientsByToken.has(userToken)) {
      clientsByToken.set(userToken, []);
    }

    // Add the socket to the list
    clientsByToken.get(userToken).push(socket);

    socket.on('message', (message) => {
      const senderId = socket.id;

      // Broadcast the message to all users with the same token
      const userSockets = clientsByToken.get(userToken);
      for (const userSocket of userSockets) {
        userSocket.emit('message', { senderId, message });


        // Schedule the message to be deleted after 4  seconds
        setTimeout(() => {
            userSocket.emit('deleteMessage', message);
        }, 4 * 1000);
        
      }
    });

    socket.on('disconnect', () => {
      // Remove the socket from the list when disconnected
      const userSockets = clientsByToken.get(userToken);
      if (userSockets) {
        const index = userSockets.indexOf(socket);
        if (index !== -1) {
          userSockets.splice(index, 1);

          // Remove the list if there are no sockets left
          if (userSockets.length === 0) {
            clientsByToken.delete(userToken);
          }
        }
      }
    });
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
