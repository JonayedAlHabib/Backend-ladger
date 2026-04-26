# Hishab-AI Complete API Flow Documentation

## System Overview
- **Base URL:** `http://localhost:3000`
- **System User (A):** Can create initial funds transactions
- **Normal User (B & C):** Can transfer money to each other

---

## Complete Scenario Flow

```
System User (A) 
    ↓ (creates account + initial funds)
    ↓
Normal User B ←→ Normal User C (money transfer between them)
    ↓ (receives 10,000 TK)
    ↓
Normal User C ←→ Normal User B (share money)
    ↓ (receives 5,000 TK)
```

---

## Phase 1: User Registration

### Step 1.1: Register System User (A)

**Endpoint:**
```
POST /api/auth/register
```

**URL:**
```
http://localhost:3000/api/auth/register
```

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "system@hishab-ai.com",
  "name": "System User",
  "password": "SystemPass@123"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0",
    "email": "system@hishab-ai.com",
    "name": "System User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Important:** After registration, **UPDATE in MongoDB** to mark as system user:
```javascript
db.users.updateOne(
  { email: "system@hishab-ai.com" },
  { $set: { systemUser: true } }
)
```

---

### Step 1.2: Login System User (A)

**Endpoint:**
```
POST /api/auth/login
```

**URL:**
```
http://localhost:3000/api/auth/login
```

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "system@hishab-ai.com",
  "password": "SystemPass@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0",
    "email": "system@hishab-ai.com",
    "name": "System User"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save Token:** `SYSTEM_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

---

### Step 1.3: Register Normal User B

**Endpoint:**
```
POST /api/auth/register
```

**URL:**
```
http://localhost:3000/api/auth/register
```

**Request Body:**
```json
{
  "email": "userb@hishab-ai.com",
  "name": "User B",
  "password": "UserBPass@123"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "_id": "65b2c3d4e5f6g7h8i9j0k1",
    "email": "userb@hishab-ai.com",
    "name": "User B"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save:** 
- `USER_B_ID = "65b2c3d4e5f6g7h8i9j0k1"`
- `USER_B_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

---

### Step 1.4: Register Normal User C

**Endpoint:**
```
POST /api/auth/register
```

**URL:**
```
http://localhost:3000/api/auth/register
```

**Request Body:**
```json
{
  "email": "userc@hishab-ai.com",
  "name": "User C",
  "password": "UserCPass@123"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "_id": "65c3d4e5f6g7h8i9j0k1l2",
    "email": "userc@hishab-ai.com",
    "name": "User C"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save:**
- `USER_C_ID = "65c3d4e5f6g7h8i9j0k1l2"`
- `USER_C_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

---

## Phase 2: Create Accounts

### Step 2.1: Create System User Account

**Endpoint:**
```
POST /api/accounts/
```

**URL:**
```
http://localhost:3000/api/accounts/
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer SYSTEM_TOKEN"
}
```

**Request Body:**
```json
{
  "currency": "BDT"
}
```

**Response (201):**
```json
{
  "success": true,
  "account": {
    "_id": "65d4e5f6g7h8i9j0k1l2m3",
    "user": "65a1b2c3d4e5f6g7h8i9j0",
    "status": "ACTIVE",
    "currency": "BDT",
    "createdAt": "2026-04-26T10:00:00Z"
  }
}
```

**Save:** `SYSTEM_ACCOUNT_ID = "65d4e5f6g7h8i9j0k1l2m3"`

---

### Step 2.2: Create User B Account

**Endpoint:**
```
POST /api/accounts/
```

**URL:**
```
http://localhost:3000/api/accounts/
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer USER_B_TOKEN"
}
```

**Request Body:**
```json
{
  "currency": "BDT"
}
```

**Response (201):**
```json
{
  "success": true,
  "account": {
    "_id": "65e5f6g7h8i9j0k1l2m3n4",
    "user": "65b2c3d4e5f6g7h8i9j0k1",
    "status": "ACTIVE",
    "currency": "BDT",
    "createdAt": "2026-04-26T10:01:00Z"
  }
}
```

**Save:** `USER_B_ACCOUNT_ID = "65e5f6g7h8i9j0k1l2m3n4"`

---

### Step 2.3: Create User C Account

**Endpoint:**
```
POST /api/accounts/
```

**URL:**
```
http://localhost:3000/api/accounts/
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer USER_C_TOKEN"
}
```

**Request Body:**
```json
{
  "currency": "BDT"
}
```

**Response (201):**
```json
{
  "success": true,
  "account": {
    "_id": "65f6g7h8i9j0k1l2m3n4o5",
    "user": "65c3d4e5f6g7h8i9j0k1l2",
    "status": "ACTIVE",
    "currency": "BDT",
    "createdAt": "2026-04-26T10:02:00Z"
  }
}
```

**Save:** `USER_C_ACCOUNT_ID = "65f6g7h8i9j0k1l2m3n4o5"`

---

## Phase 3: System User Seeds Initial Funds

### Step 3.1: System User Transfers 10,000 TK to User B

**Endpoint:**
```
POST /api/transactions/system/initial-funds
```

**URL:**
```
http://localhost:3000/api/transactions/system/initial-funds
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer SYSTEM_TOKEN"
}
```

**Request Body:**
```json
{
  "toAccount": "65e5f6g7h8i9j0k1l2m3n4",
  "amount": 10000,
  "idempotencyKey": "initial-seed-userB-001"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Initial funds credited",
  "transaction": {
    "_id": "66a1b2c3d4e5f6g7h8i9j0",
    "fromAccount": "65d4e5f6g7h8i9j0k1l2m3",
    "toAccount": "65e5f6g7h8i9j0k1l2m3n4",
    "amount": 10000,
    "status": "COMPLETED",
    "idempotencyKey": "initial-seed-userB-001",
    "createdAt": "2026-04-26T10:05:00Z"
  }
}
```

---

### Step 3.2: System User Transfers 5,000 TK to User C

**Endpoint:**
```
POST /api/transactions/system/initial-funds
```

**URL:**
```
http://localhost:3000/api/transactions/system/initial-funds
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer SYSTEM_TOKEN"
}
```

**Request Body:**
```json
{
  "toAccount": "65f6g7h8i9j0k1l2m3n4o5",
  "amount": 5000,
  "idempotencyKey": "initial-seed-userC-001"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Initial funds credited",
  "transaction": {
    "_id": "66b2c3d4e5f6g7h8i9j0k1",
    "fromAccount": "65d4e5f6g7h8i9j0k1l2m3",
    "toAccount": "65f6g7h8i9j0k1l2m3n4o5",
    "amount": 5000,
    "status": "COMPLETED",
    "idempotencyKey": "initial-seed-userC-001",
    "createdAt": "2026-04-26T10:06:00Z"
  }
}
```

---

## Phase 4: Check Account Balances

### Step 4.1: Check User B Balance

**Endpoint:**
```
GET /api/accounts/balance/:accountId
```

**URL:**
```
http://localhost:3000/api/accounts/balance/65e5f6g7h8i9j0k1l2m3n4
```

**Headers:**
```json
{
  "Authorization": "Bearer USER_B_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "accountId": "65e5f6g7h8i9j0k1l2m3n4",
  "balance": 10000,
  "currency": "BDT"
}
```

---

### Step 4.2: Check User C Balance

**Endpoint:**
```
GET /api/accounts/balance/:accountId
```

**URL:**
```
http://localhost:3000/api/accounts/balance/65f6g7h8i9j0k1l2m3n4o5
```

**Headers:**
```json
{
  "Authorization": "Bearer USER_C_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "accountId": "65f6g7h8i9j0k1l2m3n4o5",
  "balance": 5000,
  "currency": "BDT"
}
```

---

## Phase 5: Users Transfer Money to Each Other

### Step 5.1: User B Transfers 3,000 TK to User C

**Endpoint:**
```
POST /api/transactions/
```

**URL:**
```
http://localhost:3000/api/transactions/
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer USER_B_TOKEN"
}
```

**Request Body:**
```json
{
  "fromAccount": "65e5f6g7h8i9j0k1l2m3n4",
  "toAccount": "65f6g7h8i9j0k1l2m3n4o5",
  "amount": 3000,
  "idempotencyKey": "transfer-B-to-C-001",
  "description": "Payment for services"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction completed successfully",
  "transaction": {
    "_id": "66c3d4e5f6g7h8i9j0k1l2",
    "fromAccount": "65e5f6g7h8i9j0k1l2m3n4",
    "toAccount": "65f6g7h8i9j0k1l2m3n4o5",
    "amount": 3000,
    "status": "COMPLETED",
    "idempotencyKey": "transfer-B-to-C-001",
    "description": "Payment for services",
    "createdAt": "2026-04-26T10:10:00Z"
  }
}
```

---

### Step 5.2: Check User B Balance (After Transfer)

**Endpoint:**
```
GET /api/accounts/balance/:accountId
```

**URL:**
```
http://localhost:3000/api/accounts/balance/65e5f6g7h8i9j0k1l2m3n4
```

**Headers:**
```json
{
  "Authorization": "Bearer USER_B_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "accountId": "65e5f6g7h8i9j0k1l2m3n4",
  "balance": 7000,
  "currency": "BDT"
}
```

---

### Step 5.3: Check User C Balance (After Receiving)

**Endpoint:**
```
GET /api/accounts/balance/:accountId
```

**URL:**
```
http://localhost:3000/api/accounts/balance/65f6g7h8i9j0k1l2m3n4o5
```

**Headers:**
```json
{
  "Authorization": "Bearer USER_C_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "accountId": "65f6g7h8i9j0k1l2m3n4o5",
  "balance": 8000,
  "currency": "BDT"
}
```

---

### Step 5.4: User C Transfers 2,000 TK back to User B

**Endpoint:**
```
POST /api/transactions/
```

**URL:**
```
http://localhost:3000/api/transactions/
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer USER_C_TOKEN"
}
```

**Request Body:**
```json
{
  "fromAccount": "65f6g7h8i9j0k1l2m3n4o5",
  "toAccount": "65e5f6g7h8i9j0k1l2m3n4",
  "amount": 2000,
  "idempotencyKey": "transfer-C-to-B-001",
  "description": "Return payment"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction completed successfully",
  "transaction": {
    "_id": "66d4e5f6g7h8i9j0k1l2m3",
    "fromAccount": "65f6g7h8i9j0k1l2m3n4o5",
    "toAccount": "65e5f6g7h8i9j0k1l2m3n4",
    "amount": 2000,
    "status": "COMPLETED",
    "idempotencyKey": "transfer-C-to-B-001",
    "description": "Return payment",
    "createdAt": "2026-04-26T10:15:00Z"
  }
}
```

---

### Step 5.5: Final Balance Check - User B

**Endpoint:**
```
GET /api/accounts/balance/:accountId
```

**URL:**
```
http://localhost:3000/api/accounts/balance/65e5f6g7h8i9j0k1l2m3n4
```

**Response (200):**
```json
{
  "success": true,
  "accountId": "65e5f6g7h8i9j0k1l2m3n4",
  "balance": 9000,
  "currency": "BDT"
}
```

---

### Step 5.6: Final Balance Check - User C

**Endpoint:**
```
GET /api/accounts/balance/:accountId
```

**URL:**
```
http://localhost:3000/api/accounts/balance/65f6g7h8i9j0k1l2m3n4o5
```

**Response (200):**
```json
{
  "success": true,
  "accountId": "65f6g7h8i9j0k1l2m3n4o5",
  "balance": 6000,
  "currency": "BDT"
}
```

---

## Phase 6: View Transactions

### Step 6.1: System User Views All Transactions

**Endpoint:**
```
GET /api/transactions/
```

**URL:**
```
http://localhost:3000/api/transactions/
```

**Headers:**
```json
{
  "Authorization": "Bearer SYSTEM_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "count": 4,
  "transactions": [
    {
      "_id": "66a1b2c3d4e5f6g7h8i9j0",
      "fromAccount": "65d4e5f6g7h8i9j0k1l2m3",
      "toAccount": "65e5f6g7h8i9j0k1l2m3n4",
      "amount": 10000,
      "status": "COMPLETED",
      "idempotencyKey": "initial-seed-userB-001",
      "createdAt": "2026-04-26T10:05:00Z"
    },
    {
      "_id": "66b2c3d4e5f6g7h8i9j0k1",
      "fromAccount": "65d4e5f6g7h8i9j0k1l2m3",
      "toAccount": "65f6g7h8i9j0k1l2m3n4o5",
      "amount": 5000,
      "status": "COMPLETED",
      "idempotencyKey": "initial-seed-userC-001",
      "createdAt": "2026-04-26T10:06:00Z"
    },
    {
      "_id": "66c3d4e5f6g7h8i9j0k1l2",
      "fromAccount": "65e5f6g7h8i9j0k1l2m3n4",
      "toAccount": "65f6g7h8i9j0k1l2m3n4o5",
      "amount": 3000,
      "status": "COMPLETED",
      "idempotencyKey": "transfer-B-to-C-001",
      "createdAt": "2026-04-26T10:10:00Z"
    },
    {
      "_id": "66d4e5f6g7h8i9j0k1l2m3",
      "fromAccount": "65f6g7h8i9j0k1l2m3n4o5",
      "toAccount": "65e5f6g7h8i9j0k1l2m3n4",
      "amount": 2000,
      "status": "COMPLETED",
      "idempotencyKey": "transfer-C-to-B-001",
      "createdAt": "2026-04-26T10:15:00Z"
    }
  ]
}
```

---

### Step 6.2: View Single Transaction

**Endpoint:**
```
GET /api/transactions/:transactionId
```

**URL:**
```
http://localhost:3000/api/transactions/66c3d4e5f6g7h8i9j0k1l2
```

**Headers:**
```json
{
  "Authorization": "Bearer USER_B_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "transaction": {
    "_id": "66c3d4e5f6g7h8i9j0k1l2",
    "fromAccount": {
      "_id": "65e5f6g7h8i9j0k1l2m3n4",
      "user": "65b2c3d4e5f6g7h8i9j0k1",
      "status": "ACTIVE",
      "currency": "BDT"
    },
    "toAccount": {
      "_id": "65f6g7h8i9j0k1l2m3n4o5",
      "user": "65c3d4e5f6g7h8i9j0k1l2",
      "status": "ACTIVE",
      "currency": "BDT"
    },
    "amount": 3000,
    "status": "COMPLETED",
    "idempotencyKey": "transfer-B-to-C-001",
    "description": "Payment for services",
    "createdAt": "2026-04-26T10:10:00Z"
  }
}
```

---

## Phase 7: Accept Pending Transactions (if needed)

### Step 7.1: System User Accepts Pending Transaction

**Endpoint:**
```
POST /api/transactions/:transactionId/accept
```

**URL:**
```
http://localhost:3000/api/transactions/66c3d4e5f6g7h8i9j0k1l2/accept
```

**Headers:**
```json
{
  "Authorization": "Bearer SYSTEM_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction accepted and completed",
  "transaction": {
    "_id": "66c3d4e5f6g7h8i9j0k1l2",
    "fromAccount": "65e5f6g7h8i9j0k1l2m3n4",
    "toAccount": "65f6g7h8i9j0k1l2m3n4o5",
    "amount": 3000,
    "status": "COMPLETED",
    "idempotencyKey": "transfer-B-to-C-001"
  }
}
```

---

## Phase 8: Logout

### Step 8.1: System User Logout

**Endpoint:**
```
POST /api/auth/logout
```

**URL:**
```
http://localhost:3000/api/auth/logout
```

**Headers:**
```json
{
  "Authorization": "Bearer SYSTEM_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Step 8.2: User B Logout

**Endpoint:**
```
POST /api/auth/logout
```

**URL:**
```
http://localhost:3000/api/auth/logout
```

**Headers:**
```json
{
  "Authorization": "Bearer USER_B_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Step 8.3: User C Logout

**Endpoint:**
```
POST /api/auth/logout
```

**URL:**
```
http://localhost:3000/api/auth/logout
```

**Headers:**
```json
{
  "Authorization": "Bearer USER_C_TOKEN"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Summary Table

| Phase | Step | Action | User | Result |
|-------|------|--------|------|--------|
| 1 | 1.1 | Register | System | Created |
| 1 | 1.2 | Login | System | Token obtained |
| 1 | 1.3 | Register | User B | Created |
| 1 | 1.4 | Register | User C | Created |
| 2 | 2.1 | Create Account | System | Account ID: SYSTEM_ACCOUNT_ID |
| 2 | 2.2 | Create Account | User B | Account ID: USER_B_ACCOUNT_ID |
| 2 | 2.3 | Create Account | User C | Account ID: USER_C_ACCOUNT_ID |
| 3 | 3.1 | Seed 10,000 TK | System → B | B Balance: 10,000 |
| 3 | 3.2 | Seed 5,000 TK | System → C | C Balance: 5,000 |
| 4 | 4.1 | Check Balance | User B | 10,000 BDT |
| 4 | 4.2 | Check Balance | User C | 5,000 BDT |
| 5 | 5.1 | Transfer 3,000 TK | B → C | COMPLETED |
| 5 | 5.2 | Check Balance | User B | 7,000 BDT |
| 5 | 5.3 | Check Balance | User C | 8,000 BDT |
| 5 | 5.4 | Transfer 2,000 TK | C → B | COMPLETED |
| 5 | 5.5 | Check Balance | User B | 9,000 BDT |
| 5 | 5.6 | Check Balance | User C | 6,000 BDT |
| 6 | 6.1 | View All | System | 4 Transactions |
| 6 | 6.2 | View Single | User B | 1 Transaction |
| 8 | 8.1-8.3 | Logout | All Users | Done |

---

## Important Notes

1. **Idempotency Keys:** Each transaction must have a unique `idempotencyKey` to prevent duplicate transactions
2. **Authentication:** All endpoints require `Authorization: Bearer TOKEN` header
3. **System User:** Only marked system users can access `/system/initial-funds` and `/transactions/` endpoints
4. **Currency:** Default is BDT (Bangladeshi Taka)
5. **Status Codes:**
   - `200` - Success (GET requests)
   - `201` - Created (POST requests)
   - `400` - Bad Request (validation error)
   - `401` - Unauthorized (missing/invalid token)
   - `403` - Forbidden (not system user)
   - `409` - Conflict (duplicate idempotency key)
   - `500` - Server Error

---

## Testing with cURL

```bash
# Register System User
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"system@hishab-ai.com","name":"System User","password":"SystemPass@123"}'

# Login System User
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"system@hishab-ai.com","password":"SystemPass@123"}'

# Create System Account (use token from login)
curl -X POST http://localhost:3000/api/accounts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SYSTEM_TOKEN" \
  -d '{"currency":"BDT"}'

# Send Initial Funds to User B
curl -X POST http://localhost:3000/api/transactions/system/initial-funds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SYSTEM_TOKEN" \
  -d '{"toAccount":"USER_B_ACCOUNT_ID","amount":10000,"idempotencyKey":"initial-seed-userB-001"}'
```

---

## Error Response Examples

### 1. Insufficient Balance
```json
{
  "success": false,
  "message": "Insufficient balance. Current: 2000, Requested: 5000"
}
```

### 2. Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: token invalid or expired"
}
```

### 3. Forbidden (Not System User)
```json
{
  "success": false,
  "message": "Forbidden: system user access required"
}
```

### 4. Duplicate Idempotency Key
```json
{
  "success": false,
  "message": "Transaction is still processing"
}
```

### 5. Invalid Account
```json
{
  "success": false,
  "message": "Invalid toAccount"
}
```

---

## Best Practices

✅ **Always use unique idempotency keys**
✅ **Store tokens securely**
✅ **Verify balances before transferring**
✅ **Use HTTPS in production**
✅ **Add proper error handling in your client**
✅ **Log all transactions for auditing**
✅ **Use timestamps for transaction tracking**

