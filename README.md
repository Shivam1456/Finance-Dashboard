# 💰 Finance & HR Dashboard

> **Full-Stack Web Application** — Node.js + Express + MongoDB + Vanilla JS SPA  
> Role-Based Access Control | JWT Auth | Real-Time Analytics | CSV Bulk Upload

---

## 📁 Project Structure

```
Finance/
├── backend/                  ← Node.js REST API Server
│   ├── server.js             ← Entry point
│   ├── .env                  ← Environment variables (secret config)
│   ├── package.json          ← Dependencies & npm scripts
│   ├── seed.js               ← Populate DB with test data
│   ├── test-api.js           ← Manual API test script
│   │
│   ├── controllers/          ← Business logic for each route
│   │   ├── authController.js       User registration & login
│   │   ├── dashboardController.js  Analytics aggregations
│   │   ├── recordController.js     CRUD for transactions
│   │   └── userController.js       User management
│   │
│   ├── models/               ← MongoDB database schemas
│   │   ├── User.js                 User schema (name, email, role, etc.)
│   │   └── Record.js               Transaction schema (amount, type, etc.)
│   │
│   ├── routes/               ← URL route definitions
│   │   ├── authRoutes.js           /api/auth/*
│   │   ├── dashboardRoutes.js      /api/dashboard/*
│   │   ├── recordRoutes.js         /api/records/*
│   │   └── userRoutes.js           /api/users/*
│   │
│   ├── middlewares/          ← Request processing layers
│   │   ├── auth.js                 JWT token verification
│   │   ├── rbac.js                 Role-based access control
│   │   ├── validate.js             Request body validation
│   │   └── errorHandler.js         Global error handler
│   │
│   ├── services/
│   │   └── UserService.js          User DB operations
│   │
│   └── validations/
│       └── schemas.js              Joi validation schemas
│
└── frontend/                 ← Static HTML/CSS/JS SPA
    ├── index.html            ← Complete Single Page Application
    └── README.md             ← Frontend-specific docs
```

---

## ⚙️ Setup & Installation

### Prerequisites

Make sure these are installed on your system:

| Tool | Version | Check |
|------|---------|-------|
| Node.js | v18+ | `node -v` |
| npm | v8+ | `npm -v` |
| MongoDB | v6+ | Must be running locally |

---

### Step 1 — MongoDB Start Karo

MongoDB locally chal raha hona chahiye. Default port `27017` use hota hai.

```bash
# Windows (MongoDB service)
net start MongoDB

# Ya manually
mongod
```

---

### Step 2 — Backend Setup

```bash
# 1. Backend folder mein jao
cd Finance/backend

# 2. Dependencies install karo
npm install

# 3. Environment file check karo
# .env file mein ye hona chahiye:
```

**`.env` file contents:**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/finance_dashboard
JWT_SECRET=finance_dashboard_super_secret_key_2024
```

---

### Step 3 — Server Run Karo

```bash
# Production mode
node server.js

# Ya development mode (auto-restart on file change)
npm run dev
```

Server start hone par yeh dikhega:
```
Connected to MongoDB
Backend API Server is running on port 5000
API Base URL: http://localhost:5000/api
```

---

### Step 4 — Browser Mein Open Karo

```
http://localhost:5000
```

> **Note:** Backend frontend files bhi serve karta hai — alag server ki zaroorat nahi.

---

### Step 5 — (Optional) Test Data Seed Karo

```bash
npm run seed
```

Yeh 10 sample transactions aur 1 Admin user create karta hai.

---

### Step 6 — (Optional) API Tests Chalao

```bash
npm run test-api
```

---

## 🛡️ Roles & Permissions

| Role | Dashboard | Records | Admin Panel | User Mgmt |
|------|-----------|---------|-------------|-----------|
| **Admin** | ✅ Full | ✅ CRUD | ✅ Yes | ✅ Yes |
| **Analyst** | ✅ Full | 👁️ Read | ❌ No | 👁️ Stats |
| **Viewer** | ✅ Full | 👁️ Read | ❌ No | ❌ No |

---

## 🔌 API Documentation

Base URL: `http://localhost:5000`

---

### 🔐 Authentication APIs — `/api/auth`

#### 1. Register — `POST /api/auth/register`

Naya user account banata hai.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword123",
  "role": "Admin",
  "budget": 5000,
  "salary": 80000,
  "experience": 3
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ Yes | User ka poora naam |
| `email` | string | ✅ Yes | Unique email address |
| `password` | string | ✅ Yes | Min 6 characters |
| `role` | string | ❌ No | `Admin` / `Analyst` / `Viewer` (default: `Viewer`) |
| `budget` | number | ❌ No | Monthly budget limit (alerts ke liye) |
| `salary` | number | ❌ No | User ki salary |
| `experience` | number | ❌ No | Years of experience |

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "664abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{ "error": "User already exists" }
```

---

#### 2. Login — `POST /api/auth/login`

Existing user login karta hai aur JWT token milta hai.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "664abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
```json
{ "error": "Invalid email or password" }   // 401
{ "error": "Account is inactive" }          // 403
```

> ✅ **Token use karna:** Har protected request mein `Authorization` header lagao:
> ```
> Authorization: Bearer <your_token_here>
> ```

---

### 📊 Dashboard APIs — `/api/dashboard`

> 🔒 **Protected** — JWT token required  
> 👥 **Allowed Roles:** Admin, Analyst, Viewer

#### 3. Dashboard Summary — `GET /api/dashboard/summary`

Poora financial analytics data return karta hai — charts, insights, budget alerts sab kuch.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalIncome": 15200,
    "totalExpense": 5600,
    "netBalance": 9600,
    "budget": 5000,
    "currentMonthExpense": 1150,
    "categoryBreakdown": [
      { "type": "Expense", "category": "Rent", "totalAmount": 2500 },
      { "type": "Income", "category": "Salary", "totalAmount": 15000 }
    ],
    "monthlyTrends": [
      { "year": 2026, "month": 1, "income": 5000, "expense": 920 },
      { "year": 2026, "month": 2, "income": 5200, "expense": 1000 }
    ],
    "insights": {
      "highestSpendingCategory": {
        "category": "Rent",
        "amount": 2500
      },
      "expenseComparison": {
        "status": "increased",
        "percentage": "15.00",
        "currentExpense": 1150,
        "previousExpense": 1000
      },
      "budgetAlert": "warning"
    }
  }
}
```

| Field | Description |
|-------|-------------|
| `totalIncome` | Sabhi income transactions ka total |
| `totalExpense` | Sabhi expense transactions ka total |
| `netBalance` | Income - Expense |
| `budget` | User ka set monthly budget |
| `currentMonthExpense` | Is mahine ka total kharcha |
| `categoryBreakdown` | Har category ka total (chart ke liye) |
| `monthlyTrends` | Month-wise income vs expense (graph ke liye) |
| `insights.highestSpendingCategory` | Sabse zyada kharcha kahan gaya |
| `insights.expenseComparison` | Pichhle mahine se comparison |
| `insights.budgetAlert` | `safe` / `warning` / `danger` |

---

### 📋 Records (Transactions) APIs — `/api/records`

> 🔒 **Protected** — JWT token required

#### 4. Get All Records — `GET /api/records`

Sabhi transactions fetch karta hai — filtering, sorting, pagination ke saath.

**Roles:** Admin, Analyst, Viewer

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `type` | string | `Income` ya `Expense` | `?type=Expense` |
| `category` | string | Category filter | `?category=Rent` |
| `keyword` | string | Notes/category mein search | `?keyword=salary` |
| `sort` | string | Sorting order | `?sort=amount` |
| `startDate` | date | Start date filter | `?startDate=2026-01-01` |
| `endDate` | date | End date filter | `?endDate=2026-03-31` |
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Records per page (default: 10) | `?limit=50` |
| `showDeleted` | boolean | Soft-deleted records dikhao | `?showDeleted=true` |

**Sort Values:**

| Value | Description |
|-------|-------------|
| *(empty)* | Newest first (default) |
| `date_asc` | Oldest first |
| `amount` | Highest amount first |
| `amount_asc` | Lowest amount first |

**Example Request:**
```
GET /api/records?type=Expense&sort=amount&limit=20&page=1
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 47,
  "page": 1,
  "data": [
    {
      "_id": "664abc...",
      "user": { "name": "John Doe", "email": "john@example.com" },
      "amount": 850,
      "currency": "$",
      "type": "Expense",
      "category": "Rent",
      "date": "2026-03-15T00:00:00.000Z",
      "notes": "March rent",
      "name": "",
      "isDeleted": false,
      "createdAt": "2026-03-15T10:23:11.000Z"
    }
  ]
}
```

---

#### 5. Get Single Record — `GET /api/records/:id`

Ek specific transaction fetch karta hai ID se.

**Roles:** Admin, Analyst, Viewer

```
GET /api/records/664abc123def456
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": { ...record object... }
}
```

**Error (404):**
```json
{ "error": "Record not found" }
```

---

#### 6. Create Record — `POST /api/records`

Naya transaction create karta hai.

**Roles:** Admin only 🔴

**Request Body:**
```json
{
  "amount": 5000,
  "currency": "$",
  "type": "Income",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "April salary",
  "name": "John Doe"
}
```

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `amount` | number | ✅ Yes | Any positive number |
| `type` | string | ✅ Yes | `Income` / `Expense` |
| `category` | string | ✅ Yes | Any string |
| `currency` | string | ❌ No | `$` / `₹` / `€` (default: `$`) |
| `date` | date | ❌ No | ISO date (default: today) |
| `notes` | string | ❌ No | Any text |
| `name` | string | ❌ No | Candidate/person name |

**Success Response (201):**
```json
{
  "success": true,
  "data": { ...created record... }
}
```

---

#### 7. Update Record — `PUT /api/records/:id`

Existing transaction ko update karta hai.

**Roles:** Admin only 🔴

**Request Body** (minimum 1 field required):
```json
{
  "amount": 6000,
  "notes": "Updated salary"
}
```

---

#### 8. Delete Record (Soft Delete) — `DELETE /api/records/:id`

Record ko permanently delete nahi karta — sirf `isDeleted: true` set karta hai. Data safe rehta hai.

**Roles:** Admin only 🔴

```
DELETE /api/records/664abc123def456
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{ "success": true, "data": {} }
```

---

#### 9. Restore Deleted Record — `PUT /api/records/:id/restore`

Soft-deleted record ko wapas restore karta hai.

**Roles:** Admin only 🔴

```
PUT /api/records/664abc123def456/restore
Authorization: Bearer <token>
```

---

#### 10. Bulk CSV Upload — `POST /api/records/upload`

CSV file se ek saath bahut saare transactions import karta hai.

**Roles:** Admin only 🔴

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `file` | File (.csv) | CSV file to upload |

**CSV Format (column headers):**
```
Name, Amount, Currency, Type, Category, Date, Notes
```

**Example CSV:**
```csv
Name,Amount,Currency,Type,Category,Date,Notes
Alice,5000,$,Income,Salary,2026-04-01,April salary
Bob,850,$,Expense,Rent,2026-04-05,Monthly rent
Carol,120,$,Expense,Food & Dining,2026-04-10,Groceries
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "message": "Successfully inserted 3 records."
}
```

---

### 👥 User Management APIs — `/api/users`

> 🔒 **Protected** — JWT token required

#### 11. Get All Users — `GET /api/users`

Sabhi registered users ki list.

**Roles:** Admin only 🔴

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "664abc...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Admin",
      "status": "Active",
      "salary": 80000,
      "experience": 3,
      "budget": 5000
    }
  ]
}
```

---

#### 12. Get User Stats — `GET /api/users/stats`

HR analytics ke liye — active users ki salary aur experience data.

**Roles:** Admin, Analyst

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    { "name": "John", "salary": 80000, "experience": 3, "role": "Admin" },
    { "name": "Jane", "salary": 60000, "experience": 1, "role": "Analyst" }
  ]
}
```

---

#### 13. Update User — `PUT /api/users/:id`

User ki details update karna.

**Roles:** Admin only 🔴

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "role": "Analyst",
  "status": "Active",
  "budget": 8000
}
```

---

#### 14. Delete User — `DELETE /api/users/:id`

User ko permanently delete karna.

**Roles:** Admin only 🔴

---

## 🚨 Error Handling

Sabhi errors ek consistent format mein aate hain:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad Request (validation failed / wrong data) |
| `401` | Unauthorized (no token / invalid token) |
| `403` | Forbidden (role not allowed) |
| `404` | Not Found |
| `429` | Too Many Requests (rate limited) |
| `500` | Internal Server Error |

---

## 🏗️ Architecture & Technologies

### Backend

| Technology | Version | Use |
|------------|---------|-----|
| **Node.js** | v18+ | JavaScript runtime |
| **Express.js** | v5.x | Web framework, routing |
| **MongoDB** | v6+ | NoSQL database |
| **Mongoose** | v9.x | MongoDB ODM (schema + queries) |
| **JWT (jsonwebtoken)** | v9.x | Authentication tokens |
| **bcryptjs** | v3.x | Password hashing (secure) |
| **Joi** | v18.x | Request validation schemas |
| **Multer** | v2.x | File upload (CSV) handling |
| **csv-parser** | v3.x | Parse CSV file content |
| **cors** | v2.x | Cross-Origin Resource Sharing |
| **morgan** | v1.x | HTTP request logging |
| **express-rate-limit** | v8.x | Prevent API abuse (100 req/15min) |
| **dotenv** | v17.x | Load .env config variables |

### Frontend

| Technology | Use |
|------------|-----|
| **HTML5** | Page structure |
| **CSS3** | Glassmorphism UI, custom properties, animations |
| **Vanilla JavaScript** | SPA logic, API calls (fetch API) |
| **Chart.js** (CDN) | Doughnut chart, Bar graphs |
| **Google Fonts** (CDN) | Outfit font family |

---

## 🔒 Security Features

| Feature | How it works |
|---------|-------------|
| **Password Hashing** | bcryptjs se hash hoti hai — DB mein plain text nahi |
| **JWT Auth** | Har request mein token verify hota hai |
| **RBAC** | Role check middleware har protected route par |
| **Rate Limiting** | `/api/*` routes par 100 requests/15min limit |
| **Input Validation** | Joi se request body validate hoti hai — injection prevent |
| **Soft Delete** | Data kabhi permanently delete nahi hota — restore possible |

---

## 📈 Database Models

### User Model

```
User {
  name:       String  (required)
  email:      String  (required, unique)
  password:   String  (required, hashed)
  role:       Enum    [Admin, Analyst, Viewer]
  status:     Enum    [Active, Inactive]
  salary:     Number
  experience: Number
  budget:     Number  (monthly budget for alerts)
  createdAt:  Date
  updatedAt:  Date
}
```

### Record (Transaction) Model

```
Record {
  user:      ObjectId  → ref: User  (required)
  amount:    Number    (required)
  currency:  Enum      [$, ₹, €]
  type:      Enum      [Income, Expense]  (required)
  category:  String    (required)
  date:      Date      (default: now)
  notes:     String
  name:      String    (candidate name for HR use)
  isDeleted: Boolean   (soft delete flag, default: false)
  createdAt: Date
  updatedAt: Date
}
```

---

## 🚀 Quick Start (Summary)

```bash
# 1. MongoDB start karo
net start MongoDB

# 2. Backend install & run
cd Finance/backend
npm install
node server.js

# 3. Browser mein kholo
# http://localhost:5000

# 4. Sign up karo → Login karo → Dashboard use karo!
```

---

## 📞 API Quick Reference Card

```
AUTH
  POST   /api/auth/register     → Register karo
  POST   /api/auth/login        → Login karo (token milega)

DASHBOARD (token required)
  GET    /api/dashboard/summary  → Full analytics data

RECORDS (token required)
  GET    /api/records            → Sabhi transactions (filter/sort/page)
  GET    /api/records/:id        → Ek transaction
  POST   /api/records            → Create [Admin]
  PUT    /api/records/:id        → Update [Admin]
  DELETE /api/records/:id        → Soft delete [Admin]
  PUT    /api/records/:id/restore → Restore [Admin]
  POST   /api/records/upload     → CSV bulk import [Admin]

USERS (token required)
  GET    /api/users              → Sabhi users [Admin]
  GET    /api/users/stats        → HR stats [Admin, Analyst]
  PUT    /api/users/:id          → Update user [Admin]
  DELETE /api/users/:id          → Delete user [Admin]
```

---

*Finance & HR Dashboard — Built with Node.js, Express, MongoDB, and Vanilla JS*
