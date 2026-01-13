from fastapi import FastAPI, HTTPException, Query, Path, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Initialize FastAPI app
app = FastAPI(
    title="Sample FastAPI Application",
    description="A comprehensive example demonstrating FastAPI features",
    version="1.0.0"
)

# Enums
class UserRole(str, Enum):
    admin = "admin"
    user = "user"
    guest = "guest"

# Pydantic models for request/response validation
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.user

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class User(UserBase):
    id: int
    created_at: datetime
    is_active: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "johndoe",
                "email": "john@example.com",
                "full_name": "John Doe",
                "role": "user",
                "created_at": "2024-01-15T10:00:00",
                "is_active": True
            }
        }

class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    tax: Optional[float] = Field(None, ge=0)

class Item(ItemBase):
    id: int
    owner_id: int

# In-memory database (for demonstration)
users_db: List[User] = []
items_db: List[Item] = []
user_id_counter = 1
item_id_counter = 1

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Welcome endpoint with API information"""
    return {
        "message": "Welcome to the Sample FastAPI Application",
        "version": "1.0.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Check if the API is running"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

# User endpoints
@app.post("/users/", response_model=User, status_code=201, tags=["Users"])
async def create_user(user: UserCreate):
    """Create a new user"""
    global user_id_counter
    
    # Check if username already exists
    if any(u.username == user.username for u in users_db):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    if any(u.email == user.email for u in users_db):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user (in real app, hash the password)
    new_user = User(
        id=user_id_counter,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        created_at=datetime.now(),
        is_active=True
    )
    
    users_db.append(new_user)
    user_id_counter += 1
    
    return new_user

@app.get("/users/", response_model=List[User], tags=["Users"])
async def get_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum number of records to return"),
    role: Optional[UserRole] = Query(None, description="Filter by user role")
):
    """Get list of users with pagination and optional role filter"""
    filtered_users = users_db
    
    if role:
        filtered_users = [u for u in users_db if u.role == role]
    
    return filtered_users[skip:skip + limit]

@app.get("/users/{user_id}", response_model=User, tags=["Users"])
async def get_user(
    user_id: int = Path(..., gt=0, description="The ID of the user to retrieve")
):
    """Get a specific user by ID"""
    user = next((u for u in users_db if u.id == user_id), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@app.put("/users/{user_id}", response_model=User, tags=["Users"])
async def update_user(
    user_id: int = Path(..., gt=0),
    user_update: UserBase = Body(...)
):
    """Update a user's information"""
    user = next((u for u in users_db if u.id == user_id), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields
    user.username = user_update.username
    user.email = user_update.email
    user.full_name = user_update.full_name
    user.role = user_update.role
    
    return user

@app.delete("/users/{user_id}", status_code=204, tags=["Users"])
async def delete_user(user_id: int = Path(..., gt=0)):
    """Delete a user"""
    global users_db
    
    user = next((u for u in users_db if u.id == user_id), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    users_db = [u for u in users_db if u.id != user_id]
    return None

# Item endpoints
@app.post("/users/{user_id}/items/", response_model=Item, status_code=201, tags=["Items"])
async def create_item(
    user_id: int = Path(..., gt=0),
    item: ItemBase = Body(...)
):
    """Create a new item for a user"""
    global item_id_counter
    
    # Check if user exists
    user = next((u for u in users_db if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_item = Item(
        id=item_id_counter,
        name=item.name,
        description=item.description,
        price=item.price,
        tax=item.tax,
        owner_id=user_id
    )
    
    items_db.append(new_item)
    item_id_counter += 1
    
    return new_item

@app.get("/users/{user_id}/items/", response_model=List[Item], tags=["Items"])
async def get_user_items(user_id: int = Path(..., gt=0)):
    """Get all items belonging to a user"""
    user = next((u for u in users_db if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_items = [item for item in items_db if item.owner_id == user_id]
    return user_items

@app.get("/items/", response_model=List[Item], tags=["Items"])
async def get_all_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0)
):
    """Get all items with optional price filtering"""
    filtered_items = items_db
    
    if min_price is not None:
        filtered_items = [i for i in filtered_items if i.price >= min_price]
    
    if max_price is not None:
        filtered_items = [i for i in filtered_items if i.price <= max_price]
    
    return filtered_items[skip:skip + limit]

@app.get("/items/{item_id}", response_model=Item, tags=["Items"])
async def get_item(item_id: int = Path(..., gt=0)):
    """Get a specific item by ID"""
    item = next((i for i in items_db if i.id == item_id), None)
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item

# Custom exception handler
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    print("🚀 Application starting up...")
    print("📚 API documentation available at: http://localhost:8000/docs")

@app.on_event("shutdown")
async def shutdown_event():
    print("👋 Application shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
