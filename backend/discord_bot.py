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
        "orders_channel_id": os.environ.get('DISCORD_ORDERS_CHANNEL_ID'),
        "booster_role_ids": os.environ.get('DISCORD_BOOSTER_ROLE_IDS', '').split(',')
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
    Handles both text vouches and mention-based vouches (where users tag who they vouch for)
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
                    # Skip bot messages
                    if msg.get("author", {}).get("bot"):
                        continue
                    
                    author = msg.get("author", {})
                    content = msg.get("content", "")
                    mentions = msg.get("mentions", [])
                    
                    # Build vouch content - either from text or from mentions
                    vouch_content = content
                    mentioned_users = []
                    
                    if mentions:
                        # Extract mentioned user names
                        for mention in mentions:
                            display_name = mention.get("global_name") or mention.get("username", "Unknown")
                            mentioned_users.append(display_name)
                        
                        # If no text content but has mentions, create a vouch description
                        if not content.strip() and mentioned_users:
                            vouch_content = f"Vouched for: {', '.join(mentioned_users)}"
                    
                    # Skip if still no content (no text and no mentions)
                    if not vouch_content.strip():
                        continue
                    
                    # Get author display name
                    author_display = author.get("global_name") or author.get("username", "Unknown")
                    
                    vouches.append({
                        "id": msg.get("id"),
                        "content": vouch_content[:500],  # Limit content length
                        "author": {
                            "username": author_display,
                            "avatar": f"https://cdn.discordapp.com/avatars/{author.get('id')}/{author.get('avatar')}.png" if author.get("avatar") else None,
                            "id": author.get("id")
                        },
                        "timestamp": msg.get("timestamp"),
                        "attachments": [a.get("url") for a in msg.get("attachments", [])[:3]],  # Max 3 attachments
                        "mentioned_users": mentioned_users
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

async def get_active_boosters_count() -> int:
    """
    Get count of members who have any of the booster role IDs
    Requires Server Members Intent enabled on Discord Bot settings
    """
    config = get_config()
    if not config['bot_token'] or not config['guild_id']:
        logger.error("Discord bot credentials not configured for booster count")
        return 0
    
    booster_role_ids = [r.strip() for r in config['booster_role_ids'] if r.strip()]
    if not booster_role_ids:
        logger.warning("No booster role IDs configured")
        return 0
    
    try:
        async with httpx.AsyncClient() as client:
            # Paginate through all members
            all_members = []
            after = "0"
            
            for _ in range(10):  # Max 10 requests = 10,000 members
                response = await client.get(
                    f"{DISCORD_API}/guilds/{config['guild_id']}/members",
                    headers=get_headers(),
                    params={"limit": 1000, "after": after}
                )
                
                if response.status_code == 403:
                    logger.warning("Bot lacks Server Members Intent - cannot count boosters by role")
                    return 0
                
                if response.status_code == 200:
                    members = response.json()
                    if not members:
                        break
                    all_members.extend(members)
                    after = members[-1]["user"]["id"]
                    if len(members) < 1000:
                        break
                else:
                    logger.error(f"Failed to fetch members: {response.status_code} - {response.text}")
                    break
            
            # Count members with any booster role
            booster_count = 0
            for member in all_members:
                member_roles = member.get("roles", [])
                if any(role_id in member_roles for role_id in booster_role_ids):
                    booster_count += 1
            
            logger.info(f"Found {booster_count} active boosters from {len(all_members)} total members")
            return booster_count
            
    except Exception as e:
        logger.error(f"Error fetching booster count: {e}")
        return 0


async def close_ticket_channel(channel_id: str, closed_by: str = "Staff") -> bool:
    """
    Close/delete a ticket channel
    Sends a closing message before deleting
    """
    config = get_config()
    if not config['bot_token']:
        logger.error("Discord bot token not configured")
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            # Send closing message
            embed = {
                "title": "🔒 Ticket Closed",
                "description": f"This ticket has been closed by **{closed_by}**.\n\nThank you for using The Rival Syndicate!",
                "color": 65489,  # Cyan
                "footer": {"text": "The Rival Syndicate"},
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await client.post(
                f"{DISCORD_API}/channels/{channel_id}/messages",
                headers=get_headers(),
                json={"embeds": [embed]}
            )
            
            # Wait a moment for message to send
            import asyncio
            await asyncio.sleep(1)
            
            # Delete the channel
            response = await client.delete(
                f"{DISCORD_API}/channels/{channel_id}",
                headers=get_headers()
            )
            
            if response.status_code in [200, 204]:
                logger.info(f"Ticket channel {channel_id} closed by {closed_by}")
                return True
            else:
                logger.error(f"Failed to delete channel: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"Error closing ticket channel: {e}")
        return False


async def register_slash_commands() -> bool:
    """
    Register slash commands with Discord
    Should be called once on startup or when commands change
    """
    config = get_config()
    if not config['bot_token'] or not config['guild_id']:
        logger.error("Discord credentials not configured for slash commands")
        return False
    
    # Get application ID from bot token
    try:
        async with httpx.AsyncClient() as client:
            # Get bot application info
            app_response = await client.get(
                f"{DISCORD_API}/oauth2/applications/@me",
                headers=get_headers()
            )
            
            if app_response.status_code != 200:
                logger.error(f"Failed to get application info: {app_response.text}")
                return False
            
            app_id = app_response.json().get("id")
            
            # Define slash commands
            commands = [
                {
                    "name": "close",
                    "description": "Close this ticket channel (Boosters/Admins only)",
                    "type": 1  # CHAT_INPUT
                },
                {
                    "name": "complete",
                    "description": "Mark the order as completed and close the ticket",
                    "type": 1
                }
            ]
            
            # Register commands for the guild
            for cmd in commands:
                response = await client.post(
                    f"{DISCORD_API}/applications/{app_id}/guilds/{config['guild_id']}/commands",
                    headers=get_headers(),
                    json=cmd
                )
                
                if response.status_code in [200, 201]:
                    logger.info(f"Registered slash command: /{cmd['name']}")
                else:
                    logger.error(f"Failed to register /{cmd['name']}: {response.status_code} - {response.text}")
            
            return True
            
    except Exception as e:
        logger.error(f"Error registering slash commands: {e}")
        return False


async def handle_interaction(interaction_data: dict) -> dict:
    """
    Handle Discord interaction (slash command)
    Returns the response to send back to Discord
    """
    config = get_config()
    interaction_type = interaction_data.get("type")
    
    # Type 1 = Ping (respond with pong)
    if interaction_type == 1:
        return {"type": 1}
    
    # Type 2 = Application Command
    if interaction_type == 2:
        command_name = interaction_data.get("data", {}).get("name")
        channel_id = interaction_data.get("channel_id")
        member = interaction_data.get("member", {})
        user = member.get("user", {})
        member_roles = member.get("roles", [])
        
        # Check if user has booster/admin role
        booster_role_ids = [r.strip() for r in config['booster_role_ids'] if r.strip()]
        has_permission = any(role in member_roles for role in booster_role_ids)
        
        if not has_permission:
            return {
                "type": 4,  # CHANNEL_MESSAGE_WITH_SOURCE
                "data": {
                    "content": "❌ You don't have permission to use this command.",
                    "flags": 64  # Ephemeral (only visible to user)
                }
            }
        
        if command_name == "close":
            # Close the ticket
            username = user.get("username", "Staff")
            success = await close_ticket_channel(channel_id, username)
            
            if success:
                return {
                    "type": 4,
                    "data": {
                        "content": "✅ Closing ticket...",
                        "flags": 64
                    }
                }
            else:
                return {
                    "type": 4,
                    "data": {
                        "content": "❌ Failed to close ticket. Please try again or delete manually.",
                        "flags": 64
                    }
                }
        
        elif command_name == "complete":
            # Mark order as completed and close ticket
            username = user.get("username", "Staff")
            
            # Send completion message first
            async with httpx.AsyncClient() as client:
                embed = {
                    "title": "✅ Order Completed!",
                    "description": f"Your order has been marked as **completed** by **{username}**.\n\nThank you for choosing The Rival Syndicate!\n\nThis ticket will close in 5 seconds...",
                    "color": 65489,
                    "footer": {"text": "The Rival Syndicate"},
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await client.post(
                    f"{DISCORD_API}/channels/{channel_id}/messages",
                    headers=get_headers(),
                    json={"embeds": [embed]}
                )
            
            # Close after delay
            import asyncio
            await asyncio.sleep(5)
            await close_ticket_channel(channel_id, username)
            
            return {
                "type": 4,
                "data": {
                    "content": "✅ Order marked as completed!",
                    "flags": 64
                }
            }
    
    return {"type": 1}
