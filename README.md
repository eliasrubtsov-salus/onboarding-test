# FastAPI Sample Application

A comprehensive FastAPI application demonstrating best practices and common patterns.

## Features

- **User Management**: CRUD operations for users with validation
- **Item Management**: Create and manage items linked to users
- **Data Validation**: Pydantic models with field validation
- **Query Parameters**: Pagination, filtering, and search
- **Path Parameters**: Resource identification
- **Error Handling**: Custom exception handling
- **API Documentation**: Auto-generated with Swagger UI and ReDoc
- **Enums**: Role-based user types
- **Type Hints**: Full type annotation throughout

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

### Option 1: Using uvicorn directly
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option 2: Running the Python file
```bash
python main.py
```

The API will be available at:
- Main API: http://localhost:8000
- Interactive docs (Swagger UI): http://localhost:8000/docs
- Alternative docs (ReDoc): http://localhost:8000/redoc

## API Endpoints

### Root & Health
- `GET /` - Welcome message
- `GET /health` - Health check

### Users
- `POST /users/` - Create a new user
- `GET /users/` - Get all users (with pagination and role filter)
- `GET /users/{user_id}` - Get specific user
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

### Items
- `POST /users/{user_id}/items/` - Create item for user
- `GET /users/{user_id}/items/` - Get all items for user
- `GET /items/` - Get all items (with price filtering)
- `GET /items/{item_id}` - Get specific item

## Example Usage

### Create a User
```bash
curl -X POST "http://localhost:8000/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "password": "securepassword123",
    "role": "user"
  }'
```

### Get All Users
```bash
curl "http://localhost:8000/users/?skip=0&limit=10"
```

### Create an Item
```bash
curl -X POST "http://localhost:8000/users/1/items/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 1299.99,
    "tax": 10.5
  }'
```

### Get Items with Price Filter
```bash
curl "http://localhost:8000/items/?min_price=100&max_price=2000"
```

## Project Structure

```
.
├── main.py           # Main application file
├── requirements.txt  # Python dependencies
└── README.md        # This file
```

## Key Concepts Demonstrated

1. **Pydantic Models**: Type-safe data validation with BaseModel
2. **Dependency Injection**: (can be extended with FastAPI's Depends)
3. **Path Operations**: GET, POST, PUT, DELETE
4. **Query Parameters**: With validation and defaults
5. **Path Parameters**: With validation constraints
6. **Response Models**: Type-safe responses
7. **Status Codes**: Appropriate HTTP status codes
8. **Error Handling**: HTTPException and custom handlers
9. **Documentation**: Auto-generated OpenAPI/Swagger docs
10. **Enum Types**: For constrained string values

## Next Steps

To extend this application, consider adding:
- Database integration (SQLAlchemy, MongoDB)
- Authentication & Authorization (JWT tokens)
- CORS middleware
- Background tasks
- WebSocket support
- File uploads
- Caching (Redis)
- Testing (pytest)
- Docker containerization

## License

MIT
