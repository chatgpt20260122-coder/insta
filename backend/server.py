from fastapi import FastAPI, APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta
from bson import ObjectId

# IMPORTANT: Load environment variables FIRST before importing other modules
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from models import (
    UserRegister, UserLogin, UserResponse, UserUpdate,
    PostResponse, PostCreate, CommentCreate, CommentResponse,
    StoryResponse, StoryGroupResponse
)
from auth import (
    hash_password, verify_password, create_access_token, 
    get_current_user_id, security
)
from cloudinary_config import upload_image_to_cloudinary, delete_image_from_cloudinary

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
users_collection = db.users
posts_collection = db.posts
stories_collection = db.stories

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if email already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing_username = await users_collection.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    user_dict = {
        "email": user_data.email,
        "username": user_data.username,
        "fullName": user_data.fullName,
        "password_hash": hash_password(user_data.password),
        "profilePicture": None,
        "bio": "",
        "followers": [],
        "following": [],
        "createdAt": datetime.utcnow()
    }
    
    result = await users_collection.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Create JWT token
    token = create_access_token(user_id)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "username": user_data.username,
            "fullName": user_data.fullName,
            "profilePicture": None,
            "bio": "",
            "followers": 0,
            "following": 0,
            "posts": 0
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    # Find user by email
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    
    # Count posts
    posts_count = await posts_collection.count_documents({"userId": user_id})
    
    # Create JWT token
    token = create_access_token(user_id)
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "email": user["email"],
            "username": user["username"],
            "fullName": user["fullName"],
            "profilePicture": user.get("profilePicture"),
            "bio": user.get("bio", ""),
            "followers": len(user.get("followers", [])),
            "following": len(user.get("following", [])),
            "posts": posts_count
        }
    }

@api_router.get("/auth/me")
async def get_current_user(current_user_id: str = Depends(get_current_user_id)):
    user = await users_collection.find_one({"_id": ObjectId(current_user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    posts_count = await posts_collection.count_documents({"userId": current_user_id})
    
    return {
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "username": user["username"],
            "fullName": user["fullName"],
            "profilePicture": user.get("profilePicture"),
            "bio": user.get("bio", ""),
            "followers": len(user.get("followers", [])),
            "following": len(user.get("following", [])),
            "posts": posts_count
        }
    }

# ==================== USER ROUTES ====================

@api_router.get("/users/search")
async def search_users(q: str, current_user_id: str = Depends(get_current_user_id)):
    # Search users by username or fullName
    users = await users_collection.find({
        "$or": [
            {"username": {"$regex": q, "$options": "i"}},
            {"fullName": {"$regex": q, "$options": "i"}}
        ]
    }).limit(20).to_list(20)
    
    # Get current user's following list
    current_user = await users_collection.find_one({"_id": ObjectId(current_user_id)})
    following_list = current_user.get("following", [])
    
    result = []
    for user in users:
        user_id = str(user["_id"])
        if user_id != current_user_id:  # Don't include current user
            result.append({
                "id": user_id,
                "username": user["username"],
                "fullName": user["fullName"],
                "profilePicture": user.get("profilePicture"),
                "followers": len(user.get("followers", [])),
                "isFollowing": user_id in following_list
            })
    
    return {"users": result}

@api_router.put("/users/profile")
async def update_profile(
    fullName: Optional[str] = Form(None),
    bio: Optional[str] = Form(None),
    profilePicture: Optional[UploadFile] = File(None),
    current_user_id: str = Depends(get_current_user_id)
):
    update_data = {}
    
    if fullName:
        update_data["fullName"] = fullName
    if bio is not None:
        update_data["bio"] = bio
    
    # Upload profile picture if provided
    if profilePicture:
        image_url = await upload_image_to_cloudinary(profilePicture, "instaclone/profiles")
        update_data["profilePicture"] = image_url
    
    # Update user
    await users_collection.update_one(
        {"_id": ObjectId(current_user_id)},
        {"$set": update_data}
    )
    
    # Get updated user
    user = await users_collection.find_one({"_id": ObjectId(current_user_id)})
    posts_count = await posts_collection.count_documents({"userId": current_user_id})
    
    return {
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "username": user["username"],
            "fullName": user["fullName"],
            "profilePicture": user.get("profilePicture"),
            "bio": user.get("bio", ""),
            "followers": len(user.get("followers", [])),
            "following": len(user.get("following", [])),
            "posts": posts_count
        }
    }

@api_router.post("/users/{user_id}/follow")
async def follow_user(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    if user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    # Add to current user's following list
    await users_collection.update_one(
        {"_id": ObjectId(current_user_id)},
        {"$addToSet": {"following": user_id}}
    )
    
    # Add to target user's followers list
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"followers": current_user_id}}
    )
    
    return {"message": "Following user", "isFollowing": True}

@api_router.delete("/users/{user_id}/follow")
async def unfollow_user(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    # Remove from current user's following list
    await users_collection.update_one(
        {"_id": ObjectId(current_user_id)},
        {"$pull": {"following": user_id}}
    )
    
    # Remove from target user's followers list
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"followers": current_user_id}}
    )
    
    return {"message": "Unfollowed user", "isFollowing": False}

# ==================== POST ROUTES ====================

@api_router.get("/posts/feed")
async def get_feed(
    page: int = 1,
    limit: int = 10,
    current_user_id: str = Depends(get_current_user_id)
):
    # Get current user's following list
    current_user = await users_collection.find_one({"_id": ObjectId(current_user_id)})
    following_list = current_user.get("following", [])
    following_list.append(current_user_id)  # Include own posts
    
    # If not following anyone, show all posts (discovery mode)
    skip = (page - 1) * limit
    if len(following_list) <= 1:  # Only has self
        posts = await posts_collection.find().sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    else:
        # Get posts from following users
        posts = await posts_collection.find(
            {"userId": {"$in": following_list}}
        ).sort("timestamp", -1).skip(skip).limit(limit).to_list(limit)
    
    result = []
    for post in posts:
        # Get post author info
        author = await users_collection.find_one({"_id": ObjectId(post["userId"])})
        
        # Format comments
        formatted_comments = []
        for comment in post.get("comments", []):
            formatted_comments.append({
                "id": comment["id"],
                "userId": comment["userId"],
                "username": comment["username"],
                "text": comment["text"],
                "timestamp": comment["timestamp"]
            })
        
        result.append({
            "id": str(post["_id"]),
            "userId": post["userId"],
            "username": author["username"],
            "userProfilePicture": author.get("profilePicture"),
            "imageUrl": post["imageUrl"],
            "caption": post["caption"],
            "likes": len(post.get("likes", [])),
            "liked": current_user_id in post.get("likes", []),
            "comments": formatted_comments,
            "timestamp": post["timestamp"]
        })
    
    return {"posts": result, "hasMore": len(posts) == limit}

@api_router.post("/posts")
async def create_post(
    caption: str = Form(...),
    image: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id)
):
    # Upload image to Cloudinary
    image_url = await upload_image_to_cloudinary(image, "instaclone/posts")
    
    # Create post
    post_dict = {
        "userId": current_user_id,
        "imageUrl": image_url,
        "caption": caption,
        "likes": [],
        "comments": [],
        "timestamp": datetime.utcnow()
    }
    
    result = await posts_collection.insert_one(post_dict)
    
    # Get user info
    user = await users_collection.find_one({"_id": ObjectId(current_user_id)})
    
    return {
        "id": str(result.inserted_id),
        "userId": current_user_id,
        "username": user["username"],
        "userProfilePicture": user.get("profilePicture"),
        "imageUrl": image_url,
        "caption": caption,
        "likes": 0,
        "liked": False,
        "comments": [],
        "timestamp": datetime.utcnow()
    }

@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, current_user_id: str = Depends(get_current_user_id)):
    post = await posts_collection.find_one({"_id": ObjectId(post_id)})
    if post:
        await posts_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$addToSet": {"likes": current_user_id}}
        )
        # Create notification
        await create_notification(
            user_id=post["userId"],
            actor_id=current_user_id,
            notif_type="like",
            message="curtiu sua foto",
            post_id=post_id,
            post_image=post["imageUrl"]
        )
    return {"message": "Post liked"}

@api_router.delete("/posts/{post_id}/like")
async def unlike_post(post_id: str, current_user_id: str = Depends(get_current_user_id)):
    await posts_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$pull": {"likes": current_user_id}}
    )
    return {"message": "Post unliked"}

@api_router.post("/posts/{post_id}/comments")
async def add_comment(
    post_id: str,
    comment_data: CommentCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    # Get user info
    user = await users_collection.find_one({"_id": ObjectId(current_user_id)})
    post = await posts_collection.find_one({"_id": ObjectId(post_id)})
    
    comment = {
        "id": str(ObjectId()),
        "userId": current_user_id,
        "username": user["username"],
        "text": comment_data.text,
        "timestamp": datetime.utcnow()
    }
    
    await posts_collection.update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"comments": comment}}
    )
    
    # Create notification
    if post:
        await create_notification(
            user_id=post["userId"],
            actor_id=current_user_id,
            notif_type="comment",
            message=f'comentou: "{comment_data.text[:30]}"',
            post_id=post_id,
            post_image=post["imageUrl"]
        )
    
    return comment

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, current_user_id: str = Depends(get_current_user_id)):
    # Find post
    post = await posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user owns the post
    if post["userId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    # Delete image from Cloudinary
    await delete_image_from_cloudinary(post["imageUrl"])
    
    # Delete post from database
    await posts_collection.delete_one({"_id": ObjectId(post_id)})
    
    return {"message": "Post deleted"}

# ==================== STORY ROUTES ====================

@api_router.get("/stories")
async def get_stories(current_user_id: str = Depends(get_current_user_id)):
    # Get current user's following list
    current_user = await users_collection.find_one({"_id": ObjectId(current_user_id)})
    following_list = current_user.get("following", [])
    following_list.append(current_user_id)  # Include own stories
    
    # Get stories from last 24 hours
    twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
    
    # If not following anyone, show all stories
    if len(following_list) <= 1:  # Only has self
        stories = await stories_collection.find({
            "timestamp": {"$gte": twenty_four_hours_ago}
        }).sort("timestamp", -1).to_list(100)
    else:
        stories = await stories_collection.find({
            "userId": {"$in": following_list},
            "timestamp": {"$gte": twenty_four_hours_ago}
        }).sort("timestamp", -1).to_list(100)
    
    # Group stories by user
    stories_by_user = {}
    for story in stories:
        user_id = story["userId"]
        if user_id not in stories_by_user:
            stories_by_user[user_id] = []
        stories_by_user[user_id].append(story)
    
    # Format response
    result = []
    for user_id, user_stories in stories_by_user.items():
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        result.append({
            "userId": user_id,
            "username": user["username"],
            "profilePicture": user.get("profilePicture"),
            "stories": [
                {
                    "id": str(s["_id"]),
                    "imageUrl": s["imageUrl"],
                    "timestamp": s["timestamp"]
                }
                for s in user_stories
            ]
        })
    
    return {"stories": result}

@api_router.post("/stories")
async def create_story(
    image: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id)
):
    # Upload image to Cloudinary
    image_url = await upload_image_to_cloudinary(image, "instaclone/stories")
    
    # Create story
    story_dict = {
        "userId": current_user_id,
        "imageUrl": image_url,
        "timestamp": datetime.utcnow(),
        "expiresAt": datetime.utcnow() + timedelta(hours=24)
    }
    
    result = await stories_collection.insert_one(story_dict)
    
    return {
        "id": str(result.inserted_id),
        "imageUrl": image_url,
        "timestamp": datetime.utcnow()
    }

# ==================== MESSAGES ROUTES ====================

messages_collection = db.messages

@api_router.get("/messages/conversations")
async def get_conversations(current_user_id: str = Depends(get_current_user_id)):
    """Get list of conversations"""
    # Get unique conversations
    messages = await messages_collection.find({
        "$or": [
            {"senderId": current_user_id},
            {"receiverId": current_user_id}
        ]
    }).sort("timestamp", -1).to_list(1000)
    
    # Group by conversation
    conversations = {}
    for msg in messages:
        other_user_id = msg["receiverId"] if msg["senderId"] == current_user_id else msg["senderId"]
        
        if other_user_id not in conversations:
            # Get other user info
            other_user = await users_collection.find_one({"_id": ObjectId(other_user_id)})
            if other_user:
                conversations[other_user_id] = {
                    "userId": other_user_id,
                    "username": other_user["username"],
                    "profilePicture": other_user.get("profilePicture"),
                    "lastMessage": msg["text"],
                    "timestamp": msg["timestamp"],
                    "unread": not msg.get("read", False) and msg["receiverId"] == current_user_id
                }
    
    return {"conversations": list(conversations.values())}

@api_router.get("/messages/{user_id}")
async def get_messages(user_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Get messages with a specific user"""
    messages = await messages_collection.find({
        "$or": [
            {"senderId": current_user_id, "receiverId": user_id},
            {"senderId": user_id, "receiverId": current_user_id}
        ]
    }).sort("timestamp", 1).to_list(1000)
    
    # Mark as read
    await messages_collection.update_many(
        {"senderId": user_id, "receiverId": current_user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    result = []
    for msg in messages:
        result.append({
            "id": str(msg["_id"]),
            "senderId": msg["senderId"],
            "receiverId": msg["receiverId"],
            "text": msg["text"],
            "timestamp": msg["timestamp"],
            "read": msg.get("read", False)
        })
    
    return {"messages": result}

@api_router.post("/messages/{user_id}")
async def send_message(
    user_id: str,
    message: dict,
    current_user_id: str = Depends(get_current_user_id)
):
    """Send a message to a user"""
    message_dict = {
        "senderId": current_user_id,
        "receiverId": user_id,
        "text": message.get("text", ""),
        "timestamp": datetime.utcnow(),
        "read": False
    }
    
    result = await messages_collection.insert_one(message_dict)
    
    return {
        "id": str(result.inserted_id),
        "senderId": current_user_id,
        "receiverId": user_id,
        "text": message.get("text", ""),
        "timestamp": datetime.utcnow(),
        "read": False
    }

# ==================== STORY VIEWS ROUTES ====================

story_views_collection = db.story_views

@api_router.post("/stories/{story_id}/view")
async def view_story(story_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Record a story view"""
    # Check if already viewed
    existing_view = await story_views_collection.find_one({
        "storyId": story_id,
        "userId": current_user_id
    })
    
    if not existing_view:
        await story_views_collection.insert_one({
            "storyId": story_id,
            "userId": current_user_id,
            "timestamp": datetime.utcnow()
        })
    
    return {"message": "View recorded"}

@api_router.get("/stories/{story_id}/views")
async def get_story_views(story_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Get who viewed a story"""
    # Check if story belongs to current user
    story = await stories_collection.find_one({"_id": ObjectId(story_id)})
    if not story or story["userId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    views = await story_views_collection.find({"storyId": story_id}).to_list(1000)
    
    result = []
    for view in views:
        user = await users_collection.find_one({"_id": ObjectId(view["userId"])})
        if user:
            result.append({
                "userId": view["userId"],
                "username": user["username"],
                "profilePicture": user.get("profilePicture"),
                "timestamp": view["timestamp"]
            })
    
    return {"views": result, "count": len(result)}

# ==================== POST SHARING ROUTES ====================

@api_router.post("/posts/{post_id}/share")
async def share_post(
    post_id: str,
    share_data: dict,
    current_user_id: str = Depends(get_current_user_id)
):
    """Share a post via DM"""
    user_ids = share_data.get("userIds", [])
    
    # Get post info
    post = await posts_collection.find_one({"_id": ObjectId(post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Send message to each user
    for user_id in user_ids:
        message_dict = {
            "senderId": current_user_id,
            "receiverId": user_id,
            "text": f"Compartilhou um post",
            "postId": post_id,
            "timestamp": datetime.utcnow(),
            "read": False
        }
        await messages_collection.insert_one(message_dict)
    
    return {"message": f"Shared with {len(user_ids)} users"}

# ==================== NOTIFICATIONS ROUTES ====================

notifications_collection = db.notifications

@api_router.get("/notifications")
async def get_notifications(current_user_id: str = Depends(get_current_user_id)):
    """Get user notifications"""
    notifications = await notifications_collection.find({
        "userId": current_user_id
    }).sort("timestamp", -1).limit(50).to_list(50)
    
    result = []
    for notif in notifications:
        # Get actor user info
        actor = await users_collection.find_one({"_id": ObjectId(notif["actorId"])})
        if actor:
            result.append({
                "id": str(notif["_id"]),
                "type": notif["type"],
                "actorId": notif["actorId"],
                "actorUsername": actor["username"],
                "actorProfilePicture": actor.get("profilePicture"),
                "message": notif.get("message", ""),
                "postId": notif.get("postId"),
                "postImage": notif.get("postImage"),
                "timestamp": notif["timestamp"],
                "read": notif.get("read", False)
            })
    
    return {"notifications": result}

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Mark notification as read"""
    await notifications_collection.update_one(
        {"_id": ObjectId(notification_id), "userId": current_user_id},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

# Helper function to create notification
async def create_notification(user_id: str, actor_id: str, notif_type: str, message: str, post_id: str = None, post_image: str = None):
    """Create a notification"""
    if user_id != actor_id:  # Don't notify yourself
        await notifications_collection.insert_one({
            "userId": user_id,
            "actorId": actor_id,
            "type": notif_type,
            "message": message,
            "postId": post_id,
            "postImage": post_image,
            "timestamp": datetime.utcnow(),
            "read": False
        })

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()