"""
Discord Bot Service for The Rival Syndicate
Handles ticket creation and vouches fetching
"""
import os
import httpx
import logging
from typing import Optional, List, Dict
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

DISCORD_API = "https://discord.com/api/v10"

def get_config():
    return {
        "bot_token": os.environ.get('DISCORD_BOT_TOKEN'),
        "guild_id": os.environ.get('DISCORD_GUILD_ID'),
        "ticket_category_id": os.environ.get('DISCORD_TICKET_CATEGORY_ID'),
        "vouches_channel_id": os.environ.get('DISCORD_VOUCHES_CHANNEL_ID'),
        "orders_channel_id": os.environ.get('DISCORD_ORDERS_CHANNEL_ID')
    }

def get_headers():
    config = get_config()
    return {
        "Authorization": f"Bot {config['bot_token']}",
        "Content-Type": "application/json"
    }

async def create_ticket_channel(
    order_id: str,
    discord_username: str,
    discord_id: str,
    character_name: str,
    service_type: str,
    price: float
) -> Optional[Dict]:
    """
    Create a ticket channel for an order under the specified category
    """
    config = get_config()
    if not config['bot_token'] or not config['guild_id'] or not config['ticket_category_id']:
        logger.error("Discord bot credentials not configured")
        return None
    
    try:
        # Create channel name (sanitized)
        channel_name = f"ticket-{discord_username.lower().replace('#', '-')[:20]}-{order_id[:8]}"
        channel_name = ''.join(c if c.isalnum() or c == '-' else '-' for c in channel_name)
        
        # Permission overwrites - allow the user to see the channel
        permission_overwrites = [
            {
                "id": config['guild_id'],  # @everyone - deny view
                "type": 0,  # role
                "deny": "1024"  # VIEW_CHANNEL
            }
        ]
        
        # If we have the user's Discord ID, add them
        if discord_id:
            permission_overwrites.append({
                "id": discord_id,
                "type": 1,  # member
                "allow": "1024"  # VIEW_CHANNEL
            })
        
        async with httpx.AsyncClient() as client:
            # Create the channel
            response = await client.post(
                f"{DISCORD_API}/guilds/{config['guild_id']}/channels",
                headers=get_headers(),
                json={
                    "name": channel_name,
                    "type": 0,  # Text channel
                    "parent_id": config['ticket_category_id'],
                    "permission_overwrites": permission_overwrites,
                    "topic": f"Order #{order_id[:8]} | {character_name} | {service_type}"
                }
            )
            
            if response.status_code == 201:
                channel_data = response.json()
                channel_id = channel_data.get("id")
                
                # Send initial message to the channel
                service_display = "Priority Farm" if service_type == "priority-farm" else "Lord Boosting"
                embed = {
                    "title": "🎮 New Order Created",
                    "color": 65489,  # Cyan color (#00FFD1)
                    "fields": [
                        {"name": "Customer", "value": f"<@{discord_id}>" if discord_id else discord_username, "inline": True},
                        {"name": "Character", "value": character_name, "inline": True},
                        {"name": "Service", "value": service_display, "inline": True},
                        {"name": "Price", "value": f"${price}", "inline": True},
                        {"name": "Order ID", "value": f"`{order_id[:8]}`", "inline": True},
                        {"name": "Status", "value": "⏳ Pending Payment", "inline": True}
                    ],
                    "footer": {"text": "The Rival Syndicate"},
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await client.post(
                    f"{DISCORD_API}/channels/{channel_id}/messages",
                    headers=get_headers(),
                    json={
                        "content": f"<@{discord_id}> Welcome to your order ticket!" if discord_id else f"Welcome {discord_username}!",
                        "embeds": [embed]
                    }
                )
                
                logger.info(f"Created ticket channel: {channel_name}")
                return {
                    "channel_id": channel_id,
                    "channel_name": channel_name
                }
            else:
                logger.error(f"Failed to create channel: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        logger.error(f"Error creating ticket channel: {e}")
        return None

async def send_ticket_update(channel_id: str, message: str, embed_data: Optional[Dict] = None):
    """Send an update message to a ticket channel"""
    config = get_config()
    if not config['bot_token']:
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            payload = {"content": message}
            if embed_data:
                payload["embeds"] = [embed_data]
            
            response = await client.post(
                f"{DISCORD_API}/channels/{channel_id}/messages",
                headers=get_headers(),
                json=payload
            )
            return response.status_code == 200
    except Exception as e:
        logger.error(f"Error sending ticket update: {e}")
        return False

async def fetch_vouches(limit: int = 50) -> List[Dict]:
    """
    Fetch vouches/feedback messages from the vouches channel
    """
    config = get_config()
    if not config['bot_token'] or not config['vouches_channel_id']:
        logger.error("Discord bot credentials not configured for vouches")
        return []
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{DISCORD_API}/channels/{config['vouches_channel_id']}/messages",
                headers=get_headers(),
                params={"limit": limit}
            )
            
            if response.status_code == 200:
                messages = response.json()
                vouches = []
                
                for msg in messages:
                    # Skip bot messages and empty messages
                    if msg.get("author", {}).get("bot") or not msg.get("content"):
                        continue
                    
                    author = msg.get("author", {})
                    vouches.append({
                        "id": msg.get("id"),
                        "content": msg.get("content", "")[:500],  # Limit content length
                        "author": {
                            "username": author.get("username", "Unknown"),
                            "avatar": f"https://cdn.discordapp.com/avatars/{author.get('id')}/{author.get('avatar')}.png" if author.get("avatar") else None,
                            "id": author.get("id")
                        },
                        "timestamp": msg.get("timestamp"),
                        "attachments": [a.get("url") for a in msg.get("attachments", [])[:3]]  # Max 3 attachments
                    })
                
                return vouches
            else:
                logger.error(f"Failed to fetch vouches: {response.status_code} - {response.text}")
                return []
                
    except Exception as e:
        logger.error(f"Error fetching vouches: {e}")
        return []

async def get_guild_info() -> Optional[Dict]:
    """Get basic guild information including member count"""
    config = get_config()
    if not config['bot_token'] or not config['guild_id']:
        logger.error("Discord bot credentials not configured for guild info")
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{DISCORD_API}/guilds/{config['guild_id']}?with_counts=true",
                headers=get_headers()
            )
            
            if response.status_code == 200:
                guild = response.json()
                return {
                    "name": guild.get("name"),
                    "icon": f"https://cdn.discordapp.com/icons/{config['guild_id']}/{guild.get('icon')}.png" if guild.get("icon") else None,
                    "member_count": guild.get("approximate_member_count", 0),
                    "online_count": guild.get("approximate_presence_count", 0)
                }
            else:
                logger.error(f"Failed to fetch guild info: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error fetching guild info: {e}")
        return None

async def get_orders_count() -> int:
    """Get count of messages in orders channel (completed orders)"""
    config = get_config()
    if not config['bot_token'] or not config['orders_channel_id']:
        logger.error("Discord bot credentials not configured for orders count")
        return 0
    
    try:
        async with httpx.AsyncClient() as client:
            # Fetch messages from orders channel (up to 100 at a time)
            # We'll count total messages as completed orders
            total_count = 0
            last_id = None
            
            # Fetch up to 500 messages (5 requests)
            for _ in range(5):
                params = {"limit": 100}
                if last_id:
                    params["before"] = last_id
                
                response = await client.get(
                    f"{DISCORD_API}/channels/{config['orders_channel_id']}/messages",
                    headers=get_headers(),
                    params=params
                )
                
                if response.status_code == 200:
                    messages = response.json()
                    if not messages:
                        break
                    total_count += len(messages)
                    last_id = messages[-1]["id"]
                    if len(messages) < 100:
                        break
                else:
                    logger.error(f"Failed to fetch orders: {response.status_code} - {response.text}")
                    break
            
            return total_count
    except Exception as e:
        logger.error(f"Error fetching orders count: {e}")
        return 0
