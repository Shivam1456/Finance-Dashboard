# Finance-Data
 **Full-Stack Web Application** — Node.js + Express + MongoDB + Vanilla JS SPA  
> Role-Based Access Control | JWT Auth | Real-Time Analytics | CSV Bulk Upload
<img width="1920" height="1080" alt="Screenshot (26)" src="https://github.com/user-attachments/assets/d437e6c8-d243-401f-b406-11838019f312" />

<img width="1920" height="1080" alt="Screenshot (27)" src="https://github.com/user-attachments/assets/81401a2c-be3d-4ac5-8315-e6bfb6df8027" />

<img width="1920" height="1080" alt="Screenshot (28)" src="https://github.com/user-attachments/assets/45d4e7ad-84ba-4153-a590-d102f7cbf649" />

<img width="1920" height="1080" alt="Screenshot (29)" src="https://github.com/user-attachments/assets/a53a6a89-95ac-4b7b-8c7c-2fbe0f23e169" />

<img width="1920" height="1080" alt="Screenshot (30)" src="https://github.com/user-attachments/assets/192e0dcb-f229-450d-8dc7-fc95a79a1c22" />

<img width="1920" height="1080" alt="Screenshot (31)" src="https://github.com/user-attachments/assets/09c98eb9-ab66-41d8-b5c3-77034afe9dd9" />

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

✨ Key Features
🔐 JWT-based Authentication & Authorization
🛡️ Role-Based Access Control (Admin / Analyst / Viewer)
📊 Real-Time Financial Analytics (MongoDB Aggregation)
📁 CSV Bulk Upload for Transactions
🔄 Soft Delete & Restore Functionality
⚡ Advanced Filtering, Sorting & Pagination APIs
📉 Interactive Charts (Chart.js)
🚦 Rate Limiting & Input Validation (Joi)
🏗️ Tech Stack

Backend:
Node.js • Express.js • MongoDB • Mongoose • JWT • bcrypt • Joi • Multer

Frontend:
Vanilla JavaScript (SPA) • HTML5 • CSS3 • Chart.js

🧠 System Design (Built in 12 Steps)
1. Project Structure
Clean separation: backend/ (API) + frontend/ (SPA)
Backend serves frontend → single server deployment
2. Backend Setup
Express server with:
morgan (logging)
cors (cross-origin)
express-rate-limit (100 req / 15 min)
dotenv (env config)
MongoDB connection before server start
3. Database Models

User

name, email, password (hashed), role, status, salary, budget

Record

user (ref), amount, currency, type, category, date, notes, isDeleted

👉 Passwords hashed automatically using bcrypt (Mongoose hook)

4. Authentication (JWT)
Register/Login returns JWT (valid 30 days)
Token stored in localStorage

Sent via:

Authorization: Bearer <token>
5. Role-Based Access Control (RBAC)
auth.js → verifies token
rbac.js → enforces role permissions
Role	Access
Admin	Full CRUD + Users + Upload
Analyst	Read + Analytics
Viewer	Read-only
6. REST API Architecture

Modular route structure:

/api/auth
/api/records
/api/dashboard
/api/users

All protected routes use auth + RBAC middleware chain

7. Controllers & Business Logic
Clean separation of concerns
Record APIs include:
Filtering (7+ query params)
Pagination
Sorting
Validation handled using Joi schemas
8. CSV Bulk Upload
File upload via Multer (memory storage)
Stream parsing using csv-parser
Batch insert using insertMany() for performance
9. Analytics Engine

Powered by MongoDB Aggregation Pipelines:

Total Income / Expense / Balance
Category Breakdown
Monthly Trends
Highest Spending Category
Budget Alerts
10. Frontend (Vanilla JS SPA)
Single index.html (no frameworks)
Views:
Login
Register
Dashboard
Charts:
Doughnut
Bar
Line
Token persistence via localStorage
11. Static Serving
app.use(express.static('../frontend'));

✔ Backend serves frontend → no separate deployment needed

12. Seed Data
Pre-built script to generate:
Admin / Analyst / Viewer users
Sample transactions across categories
🔌 API Snapshot
AUTH
POST   /api/auth/register
POST   /api/auth/login

DASHBOARD
GET    /api/dashboard/summary

RECORDS
GET    /api/records
POST   /api/records        (Admin)
PUT    /api/records/:id    (Admin)
DELETE /api/records/:id    (Admin)
POST   /api/records/upload (Admin)

USERS
GET    /api/users          (Admin)
GET    /api/users/stats    (Admin, Analyst)
⚙️ Setup
cd backend
npm install
npm run dev

Create .env:

PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/finance_dashboard
JWT_SECRET=your_secret_key

Run app:

http://localhost:5000
🔒 Security
Password hashing (bcrypt)
JWT authentication
Role-based authorization
Rate limiting (API protection)
Input validation (Joi)
Soft delete (data safety)
📌 Why This Project Stands Out
✅ Real-world enterprise features (RBAC + analytics + bulk upload)
✅ Clean MVC architecture
✅ Fully functional SPA without frameworks
✅ Optimized MongoDB aggregation usage
✅ Production-ready backend design
👨‍💻 Author

Your Name

⭐ Summary

This project demonstrates strong skills in:

Backend architecture & API design
Authentication & security
Data processing & analytics
Full-stack integration part apne hisab se write kar ke do jo janna chahta hai hiring team

