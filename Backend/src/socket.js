const {Server} = require("socket.io");

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected: ', socket.id);

    socket.on('register', (roomId) => {
      socket.join(`room:${roomId}`);
      socket.data.roomId = roomId;
      console.log(`Socket ${socket.id} registered to room:${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
}


function getIO() {
  if(!io) throw new Error('Socket.IO not initialized yet - call initSocket(server) first');
  return io;
}

function isUserOnline(roomId) {
  const room = io.sockets.adapter.rooms.get(`room:${roomId}`);
  return !!(room && room.size > 0);
}

module.exports = { initSocket, getIO, isUserOnline };