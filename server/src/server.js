const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const initSocket = require('./sockets/socketManager');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// Attach socket.io instance to express app
app.set('io', io);
initSocket(io);

// Core Middlewares
app.use(
  cors({
    origin: true, // Allow configured origins
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CodeAlpha Project Management Tool API',
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to DB and start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[Server] Project Management Backend running on port ${PORT}`);
    console.log(`[Server] API Health check available at: http://localhost:${PORT}/api/health`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, server, startServer };
