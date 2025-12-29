from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Query, Header
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import httpx
from jose import JWTError, jwt
from enum import Enum

# Import Discord bot service
from discord_bot import create_ticket_channel, fetch_vouches, send_ticket_update, get_guild_info, get_orders_count, get_active_boosters_count, close_ticket_channel, register_slash_commands, handle_interaction

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Discord OAuth Config
DISCORD_CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID')
DISCORD_CLIENT_SECRET = os.environ.get('DISCORD_CLIENT_SECRET')
DISCORD_REDIRECT_URI = os.environ.get('DISCORD_REDIRECT_URI')
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

DISCORD_API_ENDPOINT = "https://discord.com/api/v10"
# URL encode the redirect URI for the OAuth URL
import urllib.parse
DISCORD_REDIRECT_URI_ENCODED = urllib.parse.quote(DISCORD_REDIRECT_URI or "", safe="")
DISCORD_OAUTH_URL = f"https://discord.com/api/oauth2/authorize?client_id={DISCORD_CLIENT_ID}&redirect_uri={DISCORD_REDIRECT_URI_ENCODED}&response_type=code&scope=identify%20email"

# Create the main app
app = FastAPI(title="The Rival Syndicate API")

# Mount static files at /api/static so it goes through the API path
from fastapi.staticfiles import StaticFiles
app.mount("/api/static", StaticFiles(directory="static"), name="static")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Enums
class UserRole(str, Enum):
    client = "client"
    booster = "booster"
    admin = "admin"

class OrderStatus(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"

class ServiceType(str, Enum):
    priority_farm = "priority-farm"
    lord_boosting = "lord-boosting"

class CharacterClass(str, Enum):
    duelist = "duelist"
    vanguard = "vanguard"
    strategist = "strategist"

# Pydantic Models
class UserBase(BaseModel):
    discord_id: str
    username: str
    discriminator: str = ""
    avatar: Optional[str] = None
    email: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    role: UserRole = UserRole.client
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(BaseModel):
    id: str
    discord_id: str
    username: str
    discriminator: str
    avatar: Optional[str]
    role: str
    created_at: datetime

class OrderCreate(BaseModel):
    service_type: ServiceType
    character_id: str
    character_name: str
    character_class: CharacterClass
    character_icon: Optional[str] = None
    price: float
    payment_method: str

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    progress: Optional[int] = None
    notes: Optional[str] = None
    booster_id: Optional[str] = None
    eta: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    discord_username: str
    service_type: str
    character_id: str
    character_name: str
    character_class: str
    character_icon: Optional[str] = None
    status: OrderStatus = OrderStatus.pending
    booster_id: Optional[str] = None
    booster_username: Optional[str] = None
    progress: int = 0
    price: float
    payment_method: str
    notes: str = ""
    eta: str = "TBD"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# JWT Token Functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

# Dependency to get current user
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        logger.warning("No authorization header provided")
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Handle "Bearer " prefix
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization
        
        logger.info(f"Attempting to decode token: {token[:20]}...")
        payload = decode_access_token(token)
        if payload is None:
            logger.warning("Token decode returned None")
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_id = payload.get("user_id")
        if user_id is None:
            logger.warning("No user_id in token payload")
            raise HTTPException(status_code=401, detail="Invalid token")
        
        logger.info(f"Looking up user with id: {user_id}")
        user = await db.users.find_one({"id": user_id})
        if user is None:
            logger.warning(f"User not found with id: {user_id}")
            raise HTTPException(status_code=401, detail="User not found")
        
        logger.info(f"Auth successful for user: {user.get('username')}")
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# Optional auth dependency
async def get_current_user_optional(authorization: Optional[str] = Header(None)):
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except:
        return None

# Admin/Booster check
def require_admin_or_booster(user: dict):
    if user.get("role") not in [UserRole.admin, UserRole.booster]:
        raise HTTPException(status_code=403, detail="Admin or Booster access required")

def require_admin(user: dict):
    if user.get("role") != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")

# ============== AUTH ROUTES ==============

@api_router.get("/auth/discord/login")
async def discord_login():
    """Redirect to Discord OAuth"""
    return RedirectResponse(url=DISCORD_OAUTH_URL)

@api_router.get("/auth/discord/callback")
async def discord_callback(code: str = None, error: str = None):
    """Handle Discord OAuth callback"""
    FRONTEND_URL = "https://boostservice.preview.emergentagent.com"
    
    if error:
        logger.error(f"Discord OAuth error: {error}")
        return RedirectResponse(url=f"{FRONTEND_URL}/?error={error}")
    
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/?error=no_code")
    
    try:
        # Exchange code for access token
        async with httpx.AsyncClient() as http_client:
            token_response = await http_client.post(
                f"{DISCORD_API_ENDPOINT}/oauth2/token",
                data={
                    "client_id": DISCORD_CLIENT_ID,
                    "client_secret": DISCORD_CLIENT_SECRET,
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": DISCORD_REDIRECT_URI,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if token_response.status_code != 200:
                logger.error(f"Token exchange failed: {token_response.text}")
                return RedirectResponse(url=f"{FRONTEND_URL}/?error=token_exchange_failed")
            
            token_data = token_response.json()
            discord_access_token = token_data.get("access_token")
            
            # Get user info from Discord
            user_response = await http_client.get(
                f"{DISCORD_API_ENDPOINT}/users/@me",
                headers={"Authorization": f"Bearer {discord_access_token}"}
            )
            
            if user_response.status_code != 200:
                logger.error(f"Failed to get user info: {user_response.text}")
                return RedirectResponse(url=f"{FRONTEND_URL}/?error=user_info_failed")
            
            discord_user = user_response.json()
            
        # Check if user exists
        existing_user = await db.users.find_one({"discord_id": discord_user["id"]})
        
        if existing_user:
            # Update existing user
            await db.users.update_one(
                {"discord_id": discord_user["id"]},
                {"$set": {
                    "username": discord_user["username"],
                    "discriminator": discord_user.get("discriminator", ""),
                    "avatar": f"https://cdn.discordapp.com/avatars/{discord_user['id']}/{discord_user.get('avatar')}.png" if discord_user.get("avatar") else None,
                    "email": discord_user.get("email"),
                    "updated_at": datetime.utcnow()
                }}
            )
            user = await db.users.find_one({"discord_id": discord_user["id"]})
        else:
            # Create new user
            new_user = User(
                discord_id=discord_user["id"],
                username=discord_user["username"],
                discriminator=discord_user.get("discriminator", ""),
                avatar=f"https://cdn.discordapp.com/avatars/{discord_user['id']}/{discord_user.get('avatar')}.png" if discord_user.get("avatar") else None,
                email=discord_user.get("email"),
                role=UserRole.client
            )
            await db.users.insert_one(new_user.dict())
            user = new_user.dict()
        
        # Create JWT token
        access_token = create_access_token({"user_id": user["id"], "discord_id": user["discord_id"]})
        
        # Redirect to frontend with token in URL
        import urllib.parse
        import json
        user_data = {
            "id": user["id"],
            "discord_id": user["discord_id"],
            "username": user["username"],
            "discriminator": user.get("discriminator", ""),
            "avatar": user.get("avatar"),
            "role": user.get("role", "client")
        }
        user_json = urllib.parse.quote(json.dumps(user_data))
        
        return RedirectResponse(
            url=f"{FRONTEND_URL}/auth/callback?token={access_token}&user={user_json}"
        )
        
    except Exception as e:
        logger.error(f"Discord callback error: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/?error=server_error")

@api_router.get("/auth/me")
async def get_me(authorization: Optional[str] = Header(None)):
    """Get current authenticated user"""
    user = await get_current_user(authorization)
    return UserResponse(
        id=user["id"],
        discord_id=user["discord_id"],
        username=user["username"],
        discriminator=user.get("discriminator", ""),
        avatar=user.get("avatar"),
        role=user.get("role", "client"),
        created_at=user.get("created_at", datetime.utcnow())
    )

# ============== USER ROUTES ==============

@api_router.patch("/users/{user_id}/role")
async def update_user_role(user_id: str, role: UserRole, authorization: Optional[str] = Header(None)):
    """Update user role (admin only)"""
    current_user = await get_current_user(authorization)
    require_admin(current_user)
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": role, "updated_at": datetime.utcnow()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": f"User role updated to {role}"}

@api_router.get("/users", response_model=List[UserResponse])
async def get_all_users(authorization: Optional[str] = Header(None)):
    """Get all users (admin only)"""
    current_user = await get_current_user(authorization)
    require_admin(current_user)
    
    users = await db.users.find().to_list(1000)
    return [UserResponse(
        id=u["id"],
        discord_id=u["discord_id"],
        username=u["username"],
        discriminator=u.get("discriminator", ""),
        avatar=u.get("avatar"),
        role=u.get("role", "client"),
        created_at=u.get("created_at", datetime.utcnow())
    ) for u in users]

# ============== ORDER ROUTES ==============

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, authorization: Optional[str] = Header(None)):
    """Create a new order and create Discord ticket"""
    user = await get_current_user(authorization)
    
    new_order = Order(
        user_id=user["id"],
        discord_username=user["username"],
        service_type=order_data.service_type,
        character_id=order_data.character_id,
        character_name=order_data.character_name,
        character_class=order_data.character_class,
        character_icon=order_data.character_icon,
        price=order_data.price,
        payment_method=order_data.payment_method
    )
    
    await db.orders.insert_one(new_order.dict())
    
    logger.info(f"New order created: {new_order.id} by {user['username']}")
    
    # Create Discord ticket channel
    try:
        ticket_result = await create_ticket_channel(
            order_id=new_order.id,
            discord_username=user["username"],
            discord_id=user.get("discord_id", ""),
            character_name=order_data.character_name,
            service_type=order_data.service_type,
            price=order_data.price
        )
        
        if ticket_result:
            # Update order with ticket channel info
            await db.orders.update_one(
                {"id": new_order.id},
                {"$set": {
                    "ticket_channel_id": ticket_result.get("channel_id"),
                    "ticket_channel_name": ticket_result.get("channel_name")
                }}
            )
            logger.info(f"Discord ticket created: {ticket_result.get('channel_name')}")
    except Exception as e:
        logger.error(f"Failed to create Discord ticket: {e}")
    
    return new_order.dict()

@api_router.get("/orders")
async def get_my_orders(authorization: Optional[str] = Header(None)):
    """Get orders for current user"""
    user = await get_current_user(authorization)
    
    orders = await db.orders.find({"user_id": user["id"]}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, authorization: Optional[str] = Header(None)):
    """Get specific order"""
    user = await get_current_user(authorization)
    
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check if user owns the order or is admin/booster
    if order["user_id"] != user["id"] and user.get("role") not in [UserRole.admin, UserRole.booster]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return order

@api_router.patch("/orders/{order_id}")
async def update_order(order_id: str, order_update: OrderUpdate, authorization: Optional[str] = Header(None)):
    """Update order (admin/booster only)"""
    user = await get_current_user(authorization)
    require_admin_or_booster(user)
    
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = {"updated_at": datetime.utcnow()}
    status_changed = False
    old_status = order.get("status")
    
    if order_update.status is not None:
        update_data["status"] = order_update.status
        if order_update.status != old_status:
            status_changed = True
    if order_update.progress is not None:
        update_data["progress"] = order_update.progress
    if order_update.notes is not None:
        update_data["notes"] = order_update.notes
    if order_update.eta is not None:
        update_data["eta"] = order_update.eta
    if order_update.booster_id is not None:
        booster = await db.users.find_one({"id": order_update.booster_id})
        if booster:
            update_data["booster_id"] = order_update.booster_id
            update_data["booster_username"] = booster["username"]
    
    await db.orders.update_one({"id": order_id}, {"$set": update_data})
    
    # Send Discord notification if status changed
    if status_changed and order.get("ticket_channel_id"):
        try:
            status_emoji = {"pending": "⏳", "in_progress": "🔄", "completed": "✅"}
            status_display = {"pending": "Pending", "in_progress": "In Progress", "completed": "Completed"}
            new_status = order_update.status
            
            embed = {
                "title": f"{status_emoji.get(new_status, '📋')} Order Status Updated",
                "color": 65489 if new_status == "completed" else 16776960,
                "fields": [
                    {"name": "New Status", "value": status_display.get(new_status, new_status), "inline": True},
                    {"name": "Progress", "value": f"{order_update.progress or order.get('progress', 0)}%", "inline": True}
                ],
                "footer": {"text": f"Updated by {user['username']}"},
                "timestamp": datetime.utcnow().isoformat()
            }
            
            if order_update.notes:
                embed["fields"].append({"name": "Notes", "value": order_update.notes[:200], "inline": False})
            
            await send_ticket_update(order["ticket_channel_id"], "", embed)
        except Exception as e:
            logger.error(f"Failed to send Discord update: {e}")
    
    updated_order = await db.orders.find_one({"id": order_id})
    return updated_order

@api_router.get("/admin/orders")
async def get_all_orders(
    status: Optional[OrderStatus] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    authorization: Optional[str] = Header(None)
):
    """Get all orders (admin/booster only)"""
    user = await get_current_user(authorization)
    require_admin_or_booster(user)
    
    query = {}
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    orders = await db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents(query)
    
    return {
        "orders": orders,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }

@api_router.get("/admin/boosters")
async def get_boosters(authorization: Optional[str] = Header(None)):
    """Get all boosters (admin only)"""
    user = await get_current_user(authorization)
    require_admin_or_booster(user)
    
    boosters = await db.users.find({"role": {"$in": ["booster", "admin"]}}).to_list(100)
    
    result = []
    for booster in boosters:
        # Count completed orders
        completed_count = await db.orders.count_documents({
            "booster_id": booster["id"],
            "status": "completed"
        })
        result.append({
            "id": booster["id"],
            "username": booster["username"],
            "avatar": booster.get("avatar"),
            "role": booster.get("role"),
            "orders_completed": completed_count
        })
    
    return result

# ============== SERVICES/CHARACTERS ROUTES ==============

# Character data (same as frontend)
ICON_BASE = "https://rivalskins.com/wp-content/uploads/marvel-assets/assets/lord-icons/"

CHARACTERS = {
    "duelist": [
        {"id": "hela", "name": "Hela", "basePrice": 25, "icon": f"{ICON_BASE}Hela%20Deluxe%20Avatar.png"},
        {"id": "hawkeye", "name": "Hawkeye", "basePrice": 25, "icon": f"{ICON_BASE}Hawkeye%20Deluxe%20Avatar.png"},
        {"id": "iron-fist", "name": "Iron Fist", "basePrice": 30, "icon": f"{ICON_BASE}Iron%20Fist%20Deluxe%20Avatar.png"},
        {"id": "magik", "name": "Magik", "basePrice": 25, "icon": f"{ICON_BASE}Magik%20Deluxe%20Avatar.png"},
        {"id": "mr-fantastic", "name": "Mr. Fantastic", "basePrice": 40, "icon": f"{ICON_BASE}Mister%20Fantastic%20Deluxe%20Avatar.png"},
        {"id": "black-panther", "name": "Black Panther", "basePrice": 20, "icon": f"{ICON_BASE}Black%20Panther%20Deluxe%20Avatar.png"},
        {"id": "blade", "name": "Blade", "basePrice": 25, "icon": f"{ICON_BASE}Blade%20Deluxe%20Avatar.png"},
        {"id": "black-widow", "name": "Black Widow", "basePrice": 20, "icon": f"{ICON_BASE}Black%20Widow%20Deluxe%20Avatar.png"},
        {"id": "daredevil", "name": "Daredevil", "basePrice": 30, "icon": f"{ICON_BASE}Daredevil%20Deluxe%20Avatar.png"},
        {"id": "human-torch", "name": "Human Torch", "basePrice": 20, "icon": f"{ICON_BASE}Human%20Torch%20Deluxe%20Avatar.png"},
        {"id": "iron-man", "name": "Iron Man", "basePrice": 20, "icon": f"{ICON_BASE}Iron%20Man%20Deluxe%20Avatar.png"},
        {"id": "moon-knight", "name": "Moon Knight", "basePrice": 20, "icon": f"{ICON_BASE}Moon%20Knight%20Deluxe%20Avatar.png"},
        {"id": "namor", "name": "Namor", "basePrice": 20, "icon": f"{ICON_BASE}Namor%20Deluxe%20Avatar.png"},
        {"id": "phoenix", "name": "Phoenix", "basePrice": 20, "icon": f"{ICON_BASE}Phoenix%20Deluxe%20Avatar.png"},
        {"id": "spider-man", "name": "Spider-Man", "basePrice": 25, "icon": f"{ICON_BASE}Spider-Man%20Deluxe%20Avatar.png"},
        {"id": "psylocke", "name": "Psylocke", "basePrice": 25, "icon": f"{ICON_BASE}Psylocke%20Deluxe%20Avatar.png"},
        {"id": "scarlet-witch", "name": "Scarlet Witch", "basePrice": 20, "icon": f"{ICON_BASE}Scarlet%20Witch%20Deluxe%20Avatar.png"},
        {"id": "squirrel-girl", "name": "Squirrel Girl", "basePrice": 20, "icon": f"{ICON_BASE}Squirrel%20Girl%20Deluxe%20Avatar.png"},
        {"id": "star-lord", "name": "Star-Lord", "basePrice": 30, "icon": f"{ICON_BASE}Star-Lord%20Deluxe%20Avatar.png"},
        {"id": "storm", "name": "Storm", "basePrice": 25, "icon": f"{ICON_BASE}Storm%20Deluxe%20Avatar.png"},
        {"id": "punisher", "name": "Punisher", "basePrice": 20, "icon": f"{ICON_BASE}The%20Punisher%20Deluxe%20Avatar.png"},
        {"id": "winter-soldier", "name": "Winter Soldier", "basePrice": 20, "icon": f"{ICON_BASE}Winter%20Soldier%20Deluxe%20Avatar.png"},
        {"id": "wolverine", "name": "Wolverine", "basePrice": 20, "icon": f"{ICON_BASE}Wolverine%20Deluxe%20Avatar.png"}
    ],
    "vanguard": [
        {"id": "thor", "name": "Thor", "basePrice": 40, "icon": f"{ICON_BASE}Thor%20Deluxe%20Avatar.png"},
        {"id": "venom", "name": "Venom", "basePrice": 40, "icon": f"{ICON_BASE}Venom%20Deluxe%20Avatar.png"},
        {"id": "dr-strange", "name": "Dr. Strange", "basePrice": 40, "icon": f"{ICON_BASE}Doctor%20Strange%20Deluxe%20Avatar.png"},
        {"id": "angela", "name": "Angela", "basePrice": 25, "icon": f"{ICON_BASE}Angela%20Deluxe%20Avatar.png"},
        {"id": "thing", "name": "Thing", "basePrice": 25, "icon": f"{ICON_BASE}The%20Thing%20Deluxe%20Avatar.png"},
        {"id": "hulk", "name": "Hulk", "basePrice": 25, "icon": f"{ICON_BASE}Hero%20Hulk%20Deluxe%20Avatar.png"},
        {"id": "groot", "name": "Groot", "basePrice": 40, "icon": f"{ICON_BASE}Groot%20Deluxe%20Avatar.png"},
        {"id": "emma-frost", "name": "Emma Frost", "basePrice": 25, "icon": f"{ICON_BASE}Emma%20Frost%20Deluxe%20Avatar.png"},
        {"id": "peni-parker", "name": "Peni Parker", "basePrice": 25, "icon": f"{ICON_BASE}Peni%20Parker%20Deluxe%20Avatar.png"},
        {"id": "captain-america", "name": "Captain America", "basePrice": 30, "icon": f"{ICON_BASE}Captain%20America%20Deluxe%20Avatar.png"},
        {"id": "magneto", "name": "Magneto", "basePrice": 40, "icon": f"{ICON_BASE}Magneto%20Deluxe%20Avatar.png"},
        {"id": "rogue", "name": "Rogue", "basePrice": 25, "icon": "https://boostservice.preview.emergentagent.com/api/static/rogue.png"}
    ],
    "strategist": [
        {"id": "adam-warlock", "name": "Adam Warlock", "basePrice": 40, "icon": f"{ICON_BASE}Adam%20Warlock%20Deluxe%20Avatar.png"},
        {"id": "cloak-dagger", "name": "Cloak & Dagger", "basePrice": 25, "icon": f"{ICON_BASE}Cloak%20&%20Dagger%20Deluxe%20Avatar.png"},
        {"id": "invisible-woman", "name": "Invisible Woman", "basePrice": 25, "icon": f"{ICON_BASE}Invisible%20Woman%20Deluxe%20Avatar.png"},
        {"id": "jeff", "name": "Jeff", "basePrice": 25, "icon": f"{ICON_BASE}Jeff%20the%20Land%20Shark%20Deluxe%20Avatar.png"},
        {"id": "loki", "name": "Loki", "basePrice": 30, "icon": f"{ICON_BASE}Loki%20Deluxe%20Avatar.png"},
        {"id": "luna-snow", "name": "Luna Snow", "basePrice": 25, "icon": f"{ICON_BASE}Luna%20Snow%20Deluxe%20Avatar.png"},
        {"id": "mantis", "name": "Mantis", "basePrice": 40, "icon": f"{ICON_BASE}Mantis%20Deluxe%20Avatar.png"},
        {"id": "rocket", "name": "Rocket", "basePrice": 20, "icon": f"{ICON_BASE}Rocket%20Raccoon%20Deluxe%20Avatar.png"},
        {"id": "ultron", "name": "Ultron", "basePrice": 40, "icon": f"{ICON_BASE}Ultron%20Deluxe%20Avatar.png"},
        {"id": "gambit", "name": "Gambit", "basePrice": 40, "icon": f"{ICON_BASE}Gambit%20Deluxe%20Avatar.png"}
    ]
}

SERVICE_TYPES = [
    {"id": "priority-farm", "name": "Priority Farm", "description": "We host the farm, you do the work", "priceModifier": 0},
    {"id": "lord-boosting", "name": "Lord Boosting", "description": "We do the farm for you", "priceModifier": 10}
]

@api_router.get("/services")
async def get_services():
    """Get all service types"""
    return SERVICE_TYPES

@api_router.get("/vouches")
async def get_vouches(limit: int = Query(20, ge=1, le=50)):
    """Get vouches/feedback from Discord channel"""
    vouches = await fetch_vouches(limit)
    return vouches

@api_router.get("/discord/info")
async def get_discord_info():
    """Get Discord server info"""
    info = await get_guild_info()
    return info or {"name": "The Rival Syndicate", "icon": None, "member_count": 0}

@api_router.get("/stats")
async def get_stats():
    """Get site statistics from Discord"""
    guild_info = await get_guild_info()
    orders_count = await get_orders_count()
    
    # Get active boosters count from Discord roles
    booster_count = await get_active_boosters_count()
    
    return {
        "orders_completed": orders_count,
        "server_members": guild_info.get("member_count", 0) if guild_info else 0,
        "active_boosters": booster_count if booster_count > 0 else 0,
        "average_rating": 4.9
    }

# Currency exchange rates cache
EXCHANGE_RATES_CACHE = {
    "rates": None,
    "last_updated": None
}

@api_router.get("/currency/rates")
async def get_exchange_rates():
    """Get currency exchange rates (base USD)"""
    from datetime import datetime, timedelta
    
    # Check cache (refresh every hour)
    if EXCHANGE_RATES_CACHE["rates"] and EXCHANGE_RATES_CACHE["last_updated"]:
        if datetime.utcnow() - EXCHANGE_RATES_CACHE["last_updated"] < timedelta(hours=1):
            return EXCHANGE_RATES_CACHE["rates"]
    
    try:
        async with httpx.AsyncClient() as client:
            # Using exchangerate-api.com free tier
            response = await client.get(
                "https://api.exchangerate-api.com/v4/latest/USD",
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                rates = {
                    "base": "USD",
                    "rates": data.get("rates", {}),
                    "updated": datetime.utcnow().isoformat()
                }
                
                # Update cache
                EXCHANGE_RATES_CACHE["rates"] = rates
                EXCHANGE_RATES_CACHE["last_updated"] = datetime.utcnow()
                
                return rates
    except Exception as e:
        logger.error(f"Error fetching exchange rates: {e}")
    
    # Fallback rates
    return {
        "base": "USD",
        "rates": {
            "USD": 1, "EUR": 0.92, "GBP": 0.79, "CAD": 1.36, "AUD": 1.53,
            "JPY": 149.50, "INR": 83.12, "BRL": 4.97, "MXN": 17.15,
            "CNY": 7.24, "KRW": 1298.50, "PHP": 55.80, "SGD": 1.34
        },
        "updated": datetime.utcnow().isoformat()
    }

@api_router.get("/characters")
async def get_all_characters():
    """Get all characters grouped by class"""
    return CHARACTERS

@api_router.get("/characters/{character_class}")
async def get_characters_by_class(character_class: CharacterClass):
    """Get characters by class"""
    return CHARACTERS.get(character_class, [])

# ============== ROOT ROUTE ==============

@api_router.get("/")
async def root():
    return {"message": "The Rival Syndicate API", "status": "online"}

# Include the router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== DISCORD INTERACTIONS ==============
from fastapi import Request
from nacl.signing import VerifyKey
from nacl.exceptions import BadSignatureError

# Discord public key for signature verification
DISCORD_PUBLIC_KEY = os.environ.get('DISCORD_PUBLIC_KEY', '')

def verify_discord_signature(signature: str, timestamp: str, body: bytes) -> bool:
    """Verify Discord interaction signature"""
    if not DISCORD_PUBLIC_KEY:
        logger.warning("DISCORD_PUBLIC_KEY not set, skipping verification")
        return True  # Skip verification if key not set (for testing)
    
    try:
        verify_key = VerifyKey(bytes.fromhex(DISCORD_PUBLIC_KEY))
        verify_key.verify(f"{timestamp}{body.decode('utf-8')}".encode(), bytes.fromhex(signature))
        return True
    except BadSignatureError:
        logger.error("Invalid Discord signature")
        return False
    except Exception as e:
        logger.error(f"Signature verification error: {e}")
        return False

@app.post("/api/discord/interactions")
async def discord_interactions(request: Request):
    """
    Handle Discord slash command interactions
    Verifies signature and responds to PING/commands
    """
    # Get headers for signature verification
    signature = request.headers.get("X-Signature-Ed25519", "")
    timestamp = request.headers.get("X-Signature-Timestamp", "")
    
    # Get raw body
    body = await request.body()
    
    # Verify signature
    if not verify_discord_signature(signature, timestamp, body):
        raise HTTPException(status_code=401, detail="Invalid request signature")
    
    # Parse JSON body
    try:
        interaction_data = await request.json()
    except:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    interaction_type = interaction_data.get("type")
    
    # Type 1 = PING - respond with PONG for verification
    if interaction_type == 1:
        logger.info("Received Discord PING, responding with PONG")
        return {"type": 1}
    
    # Handle other interaction types
    return await handle_interaction(interaction_data)

@api_router.post("/tickets/{channel_id}/close")
async def close_ticket(channel_id: str, authorization: Optional[str] = Header(None)):
    """Close a ticket channel (admin/booster only)"""
    user = await get_current_user(authorization)
    require_admin_or_booster(user)
    
    success = await close_ticket_channel(channel_id, user["username"])
    
    if success:
        # Update order status if we can find it
        order = await db.orders.find_one({"ticket_channel_id": channel_id})
        if order:
            await db.orders.update_one(
                {"id": order["id"]},
                {"$set": {"status": "completed", "updated_at": datetime.utcnow()}}
            )
        
        return {"success": True, "message": "Ticket closed successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to close ticket")

@api_router.post("/discord/register-commands")
async def register_commands(authorization: Optional[str] = Header(None)):
    """Register Discord slash commands (admin only)"""
    user = await get_current_user(authorization)
    require_admin(user)
    
    success = await register_slash_commands()
    
    if success:
        return {"success": True, "message": "Slash commands registered successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to register commands")

@app.on_event("startup")
async def startup_event():
    """Register Discord slash commands on startup"""
    logger.info("Registering Discord slash commands...")
    await register_slash_commands()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
