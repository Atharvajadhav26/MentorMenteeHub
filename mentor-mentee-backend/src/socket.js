const { Server } = require('socket.io');

let io;
const userSockets = new Map();

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: '*', // Trust all in this scope
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });

    io.on('connection', (socket) => {
      console.log('Network connected on node:', socket.id);

      socket.on('register', (userId) => {
        if(userId) {
          userSockets.set(userId, socket.id);
          console.log(`User Auth [${userId}] explicitly linked to Socket Stream`);
        }
      });

      socket.on('disconnect', () => {
        let disconnectedUserId = null;
        for (const [key, value] of userSockets.entries()) {
          if (value === socket.id) {
            disconnectedUserId = key;
            userSockets.delete(key);
            break;
          }
        }
        if(disconnectedUserId) console.log(`User Auth [${disconnectedUserId}] detached.`);
      });
    });

    return io;
  },
  
  getIO: () => {
    if (!io) throw new Error('Socket.io pipeline uninitialized.');
    return io;
  },

  emitToUser: (userId, event, data) => {
    const socketId = userSockets.get(userId);
    if (socketId && io) {
      io.to(socketId).emit(event, data);
    }
  }
};
