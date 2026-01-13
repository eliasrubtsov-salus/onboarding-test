# Real-time Chat Application

A full-featured real-time chat application built with Node.js, Express, Socket.IO, and JWT authentication. This application demonstrates WebSocket communication, user authentication, room management, and real-time messaging.

## Features

### Core Features
- ✅ **User Authentication**: Register and login with JWT tokens
- 💬 **Real-time Messaging**: Instant message delivery using WebSocket
- 🏠 **Chat Rooms**: Multiple rooms with member tracking
- 👥 **User Presence**: Online/offline status tracking
- ⌨️ **Typing Indicators**: See when other users are typing
- 📜 **Message History**: Persistent message storage per room
- 🎨 **Modern UI**: Clean, responsive interface
- 🔐 **Secure**: Password hashing with bcrypt, JWT authentication

### Technical Features
- WebSocket communication with Socket.IO
- RESTful API for authentication and room management
- In-memory data storage (easily replaceable with database)
- Token-based authentication
- Real-time event broadcasting
- Graceful connection handling

## Project Structure

```
.
├── server.js           # Main server with Express and Socket.IO
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html     # Chat UI
│   └── client.js      # Client-side WebSocket logic
└── README.md          # This file
```

## Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher

## Installation

1. **Install dependencies**:
```bash
npm install
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

### Rooms

#### Get All Rooms
```bash
GET /api/rooms
```

#### Create Room
```bash
POST /api/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Talk",
  "description": "Discuss technology and programming"
}
```

#### Get Room Messages
```bash
GET /api/rooms/:roomId/messages?limit=50&offset=0
```

### Users

#### Get Online Users
```bash
GET /api/users/online
```

### Health Check
```bash
GET /api/health
```

## WebSocket Events

### Client → Server

#### Authenticate
```javascript
socket.emit('authenticate', token);
```

#### Join Room
```javascript
socket.emit('join_room', roomId);
```

#### Leave Room
```javascript
socket.emit('leave_room', roomId);
```

#### Send Message
```javascript
socket.emit('send_message', {
  content: 'Hello, world!',
  type: 'text'
});
```

#### Typing Indicators
```javascript
socket.emit('typing_start');
socket.emit('typing_stop');
```

### Server → Client

#### Authentication Success
```javascript
socket.on('authenticated', (user) => {
  console.log('Logged in as:', user.username);
});
```

#### New Message
```javascript
socket.on('new_message', (message) => {
  console.log('New message:', message);
});
```

#### Room History
```javascript
socket.on('room_history', (messages) => {
  console.log('Room messages:', messages);
});
```

#### User Joined/Left
```javascript
socket.on('user_joined', (data) => {
  console.log(`${data.username} joined`);
});

socket.on('user_left', (data) => {
  console.log(`${data.username} left`);
});
```

## Usage Example

### 1. Register and Login
1. Open `http://localhost:3000` in your browser
2. Click "Register" and create an account
3. Login with your credentials

### 2. Join a Room
- The default "General" room will be available
- Click on any room to join and start chatting

### 3. Send Messages
- Type your message in the input field
- Press Enter or click "Send"
- Messages appear in real-time for all users in the room

### 4. Test with Multiple Users
Open the app in multiple browser windows/tabs, register different users, and test real-time messaging!

## Data Models

### User
```javascript
{
  id: string,
  username: string,
  email: string,
  password: string (hashed),
  avatar: string,
  createdAt: string (ISO),
  status: 'online' | 'offline'
}
```

### Room
```javascript
{
  id: string,
  name: string,
  description: string,
  createdAt: string (ISO),
  createdBy: string (userId),
  members: string[] (userIds)
}
```

### Message
```javascript
{
  id: string,
  roomId: string,
  userId: string,
  username: string,
  content: string,
  type: 'text',
  timestamp: string (ISO),
  edited: boolean
}
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication (7-day expiration)
- Token stored in localStorage
- Password validation (minimum 6 characters)
- CORS enabled for cross-origin requests

## Key Technologies

- **Express.js**: Web framework
- **Socket.IO**: WebSocket library for real-time communication
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

## Production Recommendations

1. **Environment Variables**: Move JWT_SECRET to .env file
2. **Database**: Replace in-memory storage with MongoDB/PostgreSQL
3. **HTTPS**: Use SSL/TLS certificates
4. **Rate Limiting**: Add rate limiting middleware
5. **Input Validation**: Enhanced validation
6. **Redis**: For Socket.IO scaling across multiple servers
7. **Logging**: Add proper logging with Winston
8. **Monitoring**: Implement health checks and metrics

## Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

### WebSocket Connection Failed
- Verify server is running
- Check CORS settings
- Ensure firewall allows WebSocket connections

## License

MIT
