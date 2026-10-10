const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.query.token ||
        (socket.handshake.headers.authorization &&
          socket.handshake.headers.authorization.split(' ')[1]);

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_codealpha_task3_key_2024'
      );

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.warn('[Socket Auth] Connection rejected:', err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.user.name} (${socket.id})`);

    // Join specific project board room
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`[Socket] ${socket.user.name} joined room: project:${projectId}`);
    });

    // Leave project board room
    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`[Socket] ${socket.user.name} left room: project:${projectId}`);
    });

    // Handle user typing or active task viewing indicator
    socket.on('task:typing', ({ projectId, taskId, isTyping }) => {
      socket.to(`project:${projectId}`).emit('task:typing', {
        taskId,
        user: { _id: socket.user._id, name: socket.user.name },
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.user?.name || socket.id}`);
    });
  });
};

module.exports = initSocket;
