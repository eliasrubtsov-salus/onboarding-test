// API Configuration
const API_URL = 'http://localhost:3000';
let socket = null;
let currentUser = null;
let currentRoom = null;
let token = localStorage.getItem('chatToken');

// DOM Elements
const authContainer = document.getElementById('authContainer');
const chatContainer = document.getElementById('chatContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const loginFormElement = document.getElementById('loginFormElement');
const registerFormElement = document.getElementById('registerFormElement');
const roomList = document.getElementById('roomList');
const messagesContainer = document.getElementById('messagesContainer');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const currentUsername = document.getElementById('currentUsername');
const logoutBtn = document.getElementById('logoutBtn');
const typingIndicator = document.getElementById('typingIndicator');

// Show/Hide Auth Forms
showRegisterLink.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    clearErrors();
});

showLoginLink.addEventListener('click', () => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearErrors();
});

// Clear error messages
function clearErrors() {
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        el.classList.add('hidden');
        el.textContent = '';
    });
}

// Show error
function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    setTimeout(() => {
        errorEl.classList.add('hidden');
    }, 5000);
}

// Show success
function showSuccess(elementId, message) {
    const successEl = document.getElementById(elementId);
    successEl.textContent = message;
    successEl.classList.remove('hidden');
    setTimeout(() => {
        successEl.classList.add('hidden');
    }, 3000);
}

// Register
registerFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        showSuccess('authSuccess', 'Registration successful! Please login.');
        
        // Switch to login form after 1 second
        setTimeout(() => {
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            document.getElementById('loginUsername').value = username;
        }, 1500);

    } catch (error) {
        showError('registerError', error.message);
    }
});

// Login
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store token
        token = data.token;
        localStorage.setItem('chatToken', token);
        currentUser = data.user;

        // Show chat interface
        authContainer.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        currentUsername.textContent = currentUser.username;

        // Initialize WebSocket
        initializeSocket();

    } catch (error) {
        showError('authError', error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('chatToken');
    token = null;
    currentUser = null;
    currentRoom = null;
    
    if (socket) {
        socket.disconnect();
        socket = null;
    }

    chatContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    messagesContainer.innerHTML = '';
    roomList.innerHTML = '';
});

// Initialize Socket Connection
function initializeSocket() {
    socket = io(API_URL);

    // Authenticate
    socket.emit('authenticate', token);

    // Handle authentication response
    socket.on('authenticated', (user) => {
        console.log('Authenticated as:', user.username);
        loadRooms();
    });

    socket.on('auth_error', (data) => {
        console.error('Authentication error:', data.message);
        logoutBtn.click();
    });

    // Handle new messages
    socket.on('new_message', (message) => {
        displayMessage(message);
    });

    // Handle room history
    socket.on('room_history', (messages) => {
        messagesContainer.innerHTML = '';
        messages.forEach(msg => displayMessage(msg));
        scrollToBottom();
    });

    // Handle user joined
    socket.on('user_joined', (data) => {
        displaySystemMessage(`${data.username} joined the room`);
    });

    // Handle user left
    socket.on('user_left', (data) => {
        displaySystemMessage(`${data.username} left the room`);
    });

    // Handle typing indicators
    socket.on('user_typing', (data) => {
        if (data.userId !== currentUser.id) {
            typingIndicator.textContent = `${data.username} is typing...`;
            typingIndicator.classList.remove('hidden');
        }
    });

    socket.on('user_stopped_typing', () => {
        typingIndicator.classList.add('hidden');
    });

    // Handle user status changes
    socket.on('user_status_change', (data) => {
        console.log(`${data.username} is now ${data.status}`);
    });

    // Handle errors
    socket.on('error', (data) => {
        console.error('Socket error:', data.message);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

// Load rooms
async function loadRooms() {
    try {
        const response = await fetch(`${API_URL}/api/rooms`);
        const rooms = await response.json();

        roomList.innerHTML = '';
        rooms.forEach(room => {
            const roomEl = document.createElement('div');
            roomEl.className = 'room-item';
            roomEl.innerHTML = `
                <h4>${room.name}</h4>
                <p>${room.description || 'No description'}</p>
                <p style="font-size: 11px;">👥 ${room.memberCount} members • 💬 ${room.messageCount} messages</p>
            `;
            roomEl.addEventListener('click', () => joinRoom(room));
            roomList.appendChild(roomEl);
        });

        // Auto-join general room
        if (rooms.length > 0) {
            joinRoom(rooms[0]);
        }
    } catch (error) {
        console.error('Failed to load rooms:', error);
    }
}

// Join room
function joinRoom(room) {
    // Leave current room if any
    if (currentRoom) {
        socket.emit('leave_room', currentRoom.id);
    }

    currentRoom = room;
    socket.emit('join_room', room.id);

    // Update UI
    document.querySelectorAll('.room-item').forEach(el => el.classList.remove('active'));
    event.target.closest('.room-item').classList.add('active');

    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
}

// Display message
function displayMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.userId === currentUser.id ? 'own' : ''}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    messageEl.innerHTML = `
        <div class="message-header">
            <strong>${message.username}</strong>
            <span>${time}</span>
        </div>
        <div class="message-content">${escapeHtml(message.content)}</div>
    `;

    messagesContainer.appendChild(messageEl);
    scrollToBottom();
}

// Display system message
function displaySystemMessage(text) {
    const messageEl = document.createElement('div');
    messageEl.style.cssText = 'text-align: center; color: #999; padding: 10px; font-size: 12px;';
    messageEl.textContent = text;
    messagesContainer.appendChild(messageEl);
    scrollToBottom();
}

// Send message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const content = messageInput.value.trim();
    if (!content || !currentRoom) return;

    socket.emit('send_message', { content, type: 'text' });
    messageInput.value = '';
    
    // Stop typing indicator
    socket.emit('typing_stop');
});

// Typing indicators
let typingTimeout;
messageInput.addEventListener('input', () => {
    if (!currentRoom) return;

    socket.emit('typing_start');

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing_stop');
    }, 1000);
});

// Utility functions
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-login if token exists
if (token) {
    fetch(`${API_URL}/api/health`)
        .then(() => {
            authContainer.classList.add('hidden');
            chatContainer.classList.remove('hidden');
            initializeSocket();
        })
        .catch(() => {
            localStorage.removeItem('chatToken');
            token = null;
        });
}
