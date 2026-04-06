# Finance Dashboard — Backend

Node.js + Express + MongoDB REST API Server

## Project Structure

```
backend/
├── server.js              ← Entry point (API server)
├── .env                   ← Environment variables
├── package.json           ← Dependencies & scripts
├── seed.js                ← Seed database with test data
├── test-api.js            ← API test script
├── controllers/           ← Route handler logic
│   ├── authController.js
│   ├── dashboardController.js
│   ├── recordController.js
│   └── userController.js
├── models/                ← MongoDB Mongoose schemas
│   ├── Record.js
│   └── User.js
├── routes/                ← Express route definitions
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── recordRoutes.js
│   └── userRoutes.js
├── middlewares/           ← Express middleware
│   ├── auth.js            ← JWT authentication
│   ├── errorHandler.js    ← Global error handler
│   ├── rbac.js            ← Role-based access control
│   └── validate.js        ← Joi request validation
├── services/
│   └── UserService.js     ← User business logic
└── validations/
    └── schemas.js         ← Joi validation schemas
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/finance_dashboard
JWT_SECRET=your_secret_key_here
```

### 3. Run the Server
```bash
# Production
npm start

# Development (with nodemon)
npm run dev
```

### 4. Seed Test Data
```bash
npm run seed
```

### 5. Test API
```bash
npm run test-api
```

## API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login & get JWT token |

### Records
| Method | URL | Roles | Description |
|--------|-----|-------|-------------|
| GET | `/api/records` | All | Get all records |
| GET | `/api/records/:id` | All | Get single record |
| POST | `/api/records` | Admin | Create record |
| PUT | `/api/records/:id` | Admin | Update record |
| DELETE | `/api/records/:id` | Admin | Soft delete record |
| PUT | `/api/records/:id/restore` | Admin | Restore deleted record |
| POST | `/api/records/upload` | Admin | Bulk upload via CSV |

### Dashboard
| Method | URL | Roles | Description |
|--------|-----|-------|-------------|
| GET | `/api/dashboard/summary` | All | Get analytics summary |

### Users
| Method | URL | Roles | Description |
|--------|-----|-------|-------------|
| GET | `/api/users` | Admin | Get all users |
| GET | `/api/users/stats` | Admin, Analyst | Get user stats |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |
