# API Contracts - The Rival Syndicate

## Overview
This document captures the API contracts for frontend-backend integration.

## Authentication (Discord OAuth)

### GET /api/auth/discord/login
Redirects user to Discord OAuth authorization page.
- **Response**: Redirect to Discord OAuth URL

### GET /api/auth/discord/callback?code={code}
Handles Discord OAuth callback and creates/updates user.
- **Query Params**: `code` - Discord authorization code
- **Response**:
```json
{
  "success": true,
  "user": {
    "id": "string",
    "discord_id": "string",
    "username": "string",
    "discriminator": "string",
    "avatar": "string",
    "role": "client|booster|admin",
    "created_at": "datetime"
  },
  "access_token": "string"
}
```

### GET /api/auth/me
Get current authenticated user.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: User object

## Users

### GET /api/users/{user_id}
Get user by ID (admin only).

### PATCH /api/users/{user_id}/role
Update user role (admin only).
- **Body**: `{ "role": "client|booster|admin" }`

## Orders

### POST /api/orders
Create new order.
- **Headers**: `Authorization: Bearer {token}`
- **Body**:
```json
{
  "service_type": "priority-farm|lord-boosting",
  "character_id": "string",
  "character_name": "string",
  "character_class": "duelist|vanguard|strategist",
  "character_icon": "string",
  "price": 25.00,
  "payment_method": "paypal|cashapp|venmo"
}
```
- **Response**: Order object

### GET /api/orders
Get orders for current user.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array of orders

### GET /api/orders/{order_id}
Get specific order.

### PATCH /api/orders/{order_id}
Update order (admin/booster only).
- **Body**:
```json
{
  "status": "pending|in_progress|completed",
  "progress": 0-100,
  "notes": "string",
  "booster_id": "string"
}
```

### GET /api/admin/orders
Get all orders (admin/booster only).
- **Query Params**: `status`, `page`, `limit`

## Services/Characters

### GET /api/services
Get all service types.

### GET /api/characters
Get all characters grouped by class.

### GET /api/characters/{class}
Get characters by class (duelist, vanguard, strategist).

## Data Models

### User
```
{
  id: ObjectId,
  discord_id: string (unique),
  username: string,
  discriminator: string,
  avatar: string,
  email: string (optional),
  role: enum["client", "booster", "admin"],
  created_at: datetime,
  updated_at: datetime
}
```

### Order
```
{
  id: ObjectId,
  user_id: ObjectId (ref User),
  discord_username: string,
  service_type: enum["priority-farm", "lord-boosting"],
  character_id: string,
  character_name: string,
  character_class: enum["duelist", "vanguard", "strategist"],
  character_icon: string,
  status: enum["pending", "in_progress", "completed"],
  booster_id: ObjectId (ref User, nullable),
  booster_username: string (nullable),
  progress: number (0-100),
  price: number,
  payment_method: string,
  notes: string,
  eta: string,
  created_at: datetime,
  updated_at: datetime
}
```

## Mock Data to Replace
- `mock.js` contains mock user, orders, boosters
- Frontend localStorage simulates login
- Replace with real API calls after backend integration

## Frontend Integration Points
1. `AuthContext.js` - login() redirects to /api/auth/discord/login
2. `AuthCallback.jsx` - handles /api/auth/discord/callback
3. `DashboardPage.jsx` - fetch orders from /api/orders
4. `AdminDashboard.jsx` - fetch from /api/admin/orders
5. `ServicesPage.jsx` - POST to /api/orders on checkout
