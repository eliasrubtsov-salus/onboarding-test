# Task Manager - .NET Backend + React Frontend

A full-stack task management application built with .NET 8 Web API backend and React frontend. Features JWT authentication, CRUD operations, task statistics, and a modern responsive UI.

## 🚀 Features

### Backend (.NET 8 Web API)
- ✅ RESTful API with JWT authentication
- 📊 Entity Framework Core with In-Memory database
- 🔐 Password hashing with BCrypt
- 📝 Swagger/OpenAPI documentation
- 🎯 Clean architecture with services and repositories
- ⚡ CORS configured for React frontend

### Frontend (React + Vite)
- ⚛️ React 18 with modern hooks
- 🎨 Responsive UI with custom CSS
- 🔐 Protected routes with authentication
- 📊 Real-time task statistics dashboard
- 🎯 Task filtering by status
- ✏️ Create, edit, delete tasks
- 📅 Due date tracking with overdue indicators
- 🎨 Priority levels with color coding

## 📁 Project Structure

```
.
├── TaskManager.API/          # .NET Backend
│   ├── Controllers/          # API Controllers
│   ├── Services/             # Business logic
│   ├── Data/                 # Database context
│   ├── Models/               # Domain models
│   ├── DTOs/                 # Data transfer objects
│   ├── Program.cs            # Application entry point
│   └── appsettings.json      # Configuration
│
└── TaskManager.UI/           # React Frontend
    ├── src/
    │   ├── components/       # Reusable components
    │   ├── contexts/         # React contexts
    │   ├── pages/            # Page components
    │   ├── services/         # API services
    │   └── App.jsx           # Main app component
    ├── package.json
    └── vite.config.js
```

## 🛠️ Prerequisites

- .NET 8 SDK
- Node.js 18+ and npm

## 🚀 Getting Started

### Backend Setup

1. Navigate to API directory and restore dependencies:
```bash
cd TaskManager.API
dotnet restore
```

2. Run the application:
```bash
dotnet run
```

The API will start at `http://localhost:5000`
Swagger UI available at: `http://localhost:5000/swagger`

### Frontend Setup

1. Navigate to UI directory and install dependencies:
```bash
cd TaskManager.UI
npm install
```

2. Start the development server:
```bash
npm run dev
```

The React app will start at `http://localhost:3000`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tasks (Requires JWT Token)
- `GET /api/tasks` - Get all user tasks
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/stats` - Get task statistics

## 🧪 Demo Account

Pre-seeded demo account:
- **Username**: `demo`
- **Password**: `demo123`

## 🎯 Data Models

### Task Statuses
- Todo
- InProgress
- Completed

### Task Priorities
- Low
- Medium
- High
- Urgent

## 🔒 Security

- Passwords hashed with BCrypt
- JWT tokens (7-day expiration)
- CORS configured for frontend
- Authorization on protected routes

## 📦 Technologies

### Backend
- .NET 8.0
- ASP.NET Core Web API
- Entity Framework Core
- JWT Authentication
- BCrypt.Net
- Swagger/OpenAPI

### Frontend
- React 18
- React Router DOM
- Axios
- Vite
- date-fns

## 📄 License

MIT
