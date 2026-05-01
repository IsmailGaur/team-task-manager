# 🚀 TaskFlow — Team Task Manager

A full-stack team task management application built with React, Node.js, Express, MongoDB, and JWT authentication. Features role-based access control, project management, task assignment, and a real-time dashboard.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| Frontend | `https://your-frontend.railway.app` |
| Backend API | `https://your-backend.railway.app` |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js (MVC pattern) |
| Database | MongoDB Atlas + Mongoose ODM |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Deployment | Railway (both frontend & backend) |

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Signup / Login / getMe
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── dashboardController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT protect + RBAC authorize
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── dashboard.js
│   ├── validators/
│   │   ├── authValidators.js
│   │   └── taskValidators.js
│   ├── server.js
│   ├── railway.toml
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js   # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── SignupPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── ProjectsPage.js
    │   │   ├── ProjectDetailPage.js
    │   │   └── TasksPage.js
    │   ├── components/
    │   │   └── layout/
    │   │       └── Layout.js    # Sidebar + main layout
    │   ├── services/
    │   │   └── api.js           # Axios API service layer
    │   ├── App.js               # Routes + protected routes
    │   └── index.css            # Tailwind + custom classes
    ├── tailwind.config.js
    └── railway.toml
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev   # Runs on http://localhost:5000
```

**Backend `.env`:**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/team-task-manager
JWT_SECRET=your_super_secure_random_string_min_32_chars
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env
npm start   # Runs on http://localhost:3000
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login + get JWT |
| GET | `/api/auth/me` | Private | Get current user |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/projects` | Private | Get projects (role-filtered) |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/projects/:id` | Private | Get single project |
| PUT | `/api/projects/:id` | Admin | Update project |
| DELETE | `/api/projects/:id` | Admin | Delete project + tasks |
| POST | `/api/projects/:id/members` | Admin | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Admin | Get all tasks |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/tasks/my` | Private | Get my assigned tasks |
| GET | `/api/tasks/project/:id` | Private | Get tasks by project |
| PATCH | `/api/tasks/:id/status` | Private | Update task status |
| PUT | `/api/tasks/:id` | Admin | Full task update |
| DELETE | `/api/tasks/:id` | Admin | Delete task |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard` | Private | Get stats + recent tasks |

### Users (Admin)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:id` | Admin | Get user |
| DELETE | `/api/users/:id` | Admin | Delete user |

---

## 👥 Role-Based Access

| Feature | Admin | Member |
|---------|-------|--------|
| Create/Delete projects | ✅ | ❌ |
| Add/remove team members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| View all tasks | ✅ | ❌ |
| View assigned projects | ✅ | ✅ |
| View own tasks | ✅ | ✅ |
| Update own task status | ✅ | ✅ |
| Dashboard | Full | Own stats |

---

## 🚀 Railway Deployment

### Deploy Backend

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → choose `backend/` as root directory
3. Add environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=<your MongoDB Atlas URI>
   JWT_SECRET=<32+ char random string>
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-frontend.railway.app
   ```
4. Railway auto-detects Node.js and deploys
5. Note your backend URL: `https://xxxx.railway.app`

### Deploy Frontend

1. New Railway service → GitHub repo → `frontend/` root
2. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```
3. Railway builds with `npm run build` and serves
4. Note your frontend URL

### Alternative: Deploy Frontend to Vercel

```bash
cd frontend
npm install -g vercel
vercel
# Set REACT_APP_API_URL env var in Vercel dashboard
```

---

## 🔒 Security Features

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with configurable expiry
- Passwords excluded from all DB queries by default
- Role-based middleware on every protected route
- Input validation via express-validator
- CORS configured for specific frontend origin
- Global error handler prevents stack trace leaks in production

---

## 📦 Sample API Requests

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Admin","email":"jane@co.com","password":"secret123","role":"Admin"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@co.com","password":"secret123"}'
```

### Create Project (with token)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Website Redesign","description":"Rebuild the company site"}'
```

---

## 🎬 Demo Script (2–5 min)

### Scene 1 — Signup & Login (30s)
> "TaskFlow is a full-stack team task manager with JWT auth and role-based access."
- Show Signup page → register as Admin
- Show login page → sign in

### Scene 2 — Admin: Create Project (45s)
> "As an Admin, I have full control over projects and tasks."
- Navigate to Projects → Create New Project
- Show the project card appear
- Open the project detail page

### Scene 3 — Admin: Add Members & Tasks (60s)
- Click "Manage Members" → add a team member user
- Click "Add Task" → fill in title, priority, assign to member, set due date
- Show tasks appearing in the list
- Demonstrate filters (Todo / In Progress / Done)

### Scene 4 — Dashboard (30s)
> "The dashboard gives a real-time overview of all stats."
- Show stat cards: Total, Completed, In Progress, Overdue
- Show progress bar and recent activity feed

### Scene 5 — Member View (60s)
> "Members have a focused view of only what they need."
- Logout → Login as a Member
- Show "My Tasks" page — only assigned tasks visible
- Update a task status using the dropdown
- Show Dashboard — member-scoped stats

### Scene 6 — Close (15s)
> "TaskFlow is fully deployed on Railway, with a React frontend, Express API, MongoDB Atlas database, and JWT authentication. Code is clean, modular, and production-ready."

---

## ⚡ Extra Features (Bonus)

- **Dark Mode**: App is dark-mode native with slate/green color palette
- **Kanban-style filtering**: Filter tasks by status on project detail page
- **Responsive**: Mobile-first layout with collapsible sidebar
- **Overdue detection**: Tasks past due date are highlighted in red
- **Priority badges**: High/Medium/Low visual indicators

---

## 🛠️ Development Tips

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Test API health
curl http://localhost:5000/health

# MongoDB Atlas: Whitelist Railway IPs
# Go to Atlas → Network Access → Add 0.0.0.0/0 for Railway
```

---

## 📝 License

MIT © 2024 — Built for educational and production use.
