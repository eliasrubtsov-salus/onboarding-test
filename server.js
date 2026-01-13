const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// In-memory data stores (use a database in production)
const users = new Map();
const rooms = new Map();
const messages = new Map();
const onlineUsers = new Map();

// Initialize default room
rooms.set('general', {
  id: 'general',
  name: 'General',
  description: 'General discussion room',
  createdAt: new Date().toISOString(),
  members: []
});
messages.set('general', []);

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// REST API Endpoints

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    users: users.size,
    rooms: rooms.size,
    onlineUsers: onlineUsers.size
  });
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = Array.from(users.values()).find(
      u => u.username === username || u.email === email
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Create user
    const userId = generateId();
    const hashedPassword = await hashPassword(password);
    
    const user = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      createdAt: new Date().toISOString(),
      status: 'offline'
    };

    users.set(userId, user);

    // Generate token
    const token = generateToken(userId);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = Array.from(users.values()).find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all rooms
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.values()).map(room => ({
    ...room,
    memberCount: room.members.length,
    messageCount: messages.get(room.id)?.length || 0
  }));

  res.json(roomList);
});

// Create a room
app.post('/api/rooms', (req, res) => {
  try {
    const { name, description } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const roomId = generateId();
    const room = {
      id: roomId,
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      createdBy: decoded.userId,
      members: [decoded.userId]
    };

    rooms.set(roomId, room);
    messages.set(roomId, []);

    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get room messages
app.get('/api/rooms/:roomId/messages', (req, res) => {
  const { roomId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const roomMessages = messages.get(roomId) || [];
  const paginatedMessages = roomMessages.slice(offset, offset + limit);

  res.json({
    messages: paginatedMessages,
    total: roomMessages.length,
    limit,
    offset
  });
});

// Get online users
app.get('/api/users/online', (req, res) => {
  const onlineUsersList = Array.from(onlineUsers.values());
  res.json(onlineUsersList);
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Authenticate user
  socket.on('authenticate', async (token) => {
    try {
      const decoded = verifyToken(token);
      
      if (!decoded) {
        socket.emit('auth_error', { message: 'Invalid token' });
        return;
      }

      const user = users.get(decoded.userId);
      
      if (!user) {
        socket.emit('auth_error', { message: 'User not found' });
        return;
      }

      // Store user info in socket
      socket.userId = user.id;
      socket.username = user.username;

      // Update user status
      user.status = 'online';
      
      // Add to online users
      const { password: _, ...userWithoutPassword } = user;
      onlineUsers.set(socket.id, userWithoutPassword);

      // Notify successful authentication
      socket.emit('authenticated', userWithoutPassword);

      // Broadcast to all users that someone came online
      io.emit('user_status_change', {
        userId: user.id,
        username: user.username,
        status: 'online'
      });

      console.log(`User authenticated: ${user.username}`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('auth_error', { message: 'Authentication failed' });
    }
  });

  // Join a room
  socket.on('join_room', (roomId) => {
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Join the socket room
    socket.join(roomId);
    socket.currentRoom = roomId;

    // Add user to room members if not already there
    if (!room.members.includes(socket.userId)) {
      room.members.push(socket.userId);
    }

    // Send recent messages to the user
    const roomMessages = messages.get(roomId) || [];
    const recentMessages = roomMessages.slice(-50);
    socket.emit('room_history', recentMessages);

    // Notify room that user joined
    io.to(roomId).emit('user_joined', {
      userId: socket.userId,
      username: socket.username,
      roomId,
      timestamp: new Date().toISOString()
    });

    console.log(`${socket.username} joined room: ${room.name}`);
  });

  // Leave a room
  socket.on('leave_room', (roomId) => {
    if (!socket.userId) return;

    socket.leave(roomId);
    
    if (socket.currentRoom === roomId) {
      socket.currentRoom = null;
    }

    // Notify room that user left
    io.to(roomId).emit('user_left', {
      userId: socket.userId,
      username: socket.username,
      roomId,
      timestamp: new Date().toISOString()
    });

    console.log(`${socket.username} left room: ${roomId}`);
  });

  // Send a message
  socket.on('send_message', (data) => {
    if (!socket.userId || !socket.currentRoom) {
      socket.emit('error', { message: 'Not authenticated or not in a room' });
      return;
    }

    const { content, type = 'text' } = data;

    if (!content || content.trim() === '') {
      socket.emit('error', { message: 'Message content is required' });
      return;
    }

    const message = {
      id: generateId(),
      roomId: socket.currentRoom,
      userId: socket.userId,
      username: socket.username,
      content: content.trim(),
      type,
      timestamp: new Date().toISOString(),
      edited: false
    };

    // Store message
    const roomMessages = messages.get(socket.currentRoom) || [];
    roomMessages.push(message);
    messages.set(socket.currentRoom, roomMessages);

    // Broadcast to room
    io.to(socket.currentRoom).emit('new_message', message);

    console.log(`Message from ${socket.username} in ${socket.currentRoom}: ${content.substring(0, 50)}`);
  });

  // Typing indicator
  socket.on('typing_start', () => {
    if (!socket.userId || !socket.currentRoom) return;

    socket.to(socket.currentRoom).emit('user_typing', {
      userId: socket.userId,
      username: socket.username
    });
  });

  socket.on('typing_stop', () => {
    if (!socket.userId || !socket.currentRoom) return;

    socket.to(socket.currentRoom).emit('user_stopped_typing', {
      userId: socket.userId,
      username: socket.username
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    if (socket.userId) {
      const user = users.get(socket.userId);
      
      if (user) {
        user.status = 'offline';
        
        // Broadcast status change
        io.emit('user_status_change', {
          userId: user.id,
          username: user.username,
          status: 'offline'
        });
      }

      // Remove from online users
      onlineUsers.delete(socket.id);

      console.log(`User disconnected: ${socket.username}`);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 Chat Server Started!');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server ready`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST   /api/auth/register  - Register new user');
  console.log('  POST   /api/auth/login     - Login user');
  console.log('  GET    /api/rooms          - Get all rooms');
  console.log('  POST   /api/rooms          - Create room');
  console.log('  GET    /api/users/online   - Get online users');
  console.log('  GET    /api/health         - Health check');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
