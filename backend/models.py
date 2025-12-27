from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    username: str
    fullName: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    bio: Optional[str] = None

class UserInDB(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    username: str
    fullName: str
    password_hash: str
    profilePicture: Optional[str] = None
    bio: str = ""
    followers: List[str] = []
    following: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    username: str
    fullName: str
    profilePicture: Optional[str] = None
    bio: str = ""
    followers: int = 0
    following: int = 0
    posts: int = 0

# Post Models
class PostCreate(BaseModel):
    caption: str

class CommentCreate(BaseModel):
    text: str

class CommentResponse(BaseModel):
    id: str
    userId: str
    username: str
    text: str
    timestamp: datetime

class PostResponse(BaseModel):
    id: str
    userId: str
    username: str
    userProfilePicture: Optional[str] = None
    imageUrl: str
    caption: str
    likes: int
    liked: bool = False
    comments: List[CommentResponse] = []
    timestamp: datetime

class PostInDB(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    imageUrl: str
    caption: str
    likes: List[str] = []  # List of user IDs who liked
    comments: List[dict] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Story Models
class StoryResponse(BaseModel):
    id: str
    imageUrl: str
    timestamp: datetime

class StoryGroupResponse(BaseModel):
    userId: str
    username: str
    profilePicture: Optional[str] = None
    stories: List[StoryResponse]

class StoryInDB(BaseModel):
    id: str = Field(alias="_id")
    userId: str
    imageUrl: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    expiresAt: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
