# CodeAlpha Task 3: Full-Stack Project Management Tool

A modern, production-grade Project Management Tool built for **CodeAlpha Full Stack Development Internship Task 3**.

---

## 🌟 Overview & Features

### 1. Secure Authentication & User Management
- User Registration, Login, and Profile management with JWT authentication.
- Password hashing using `bcryptjs` with salt rounds.
- Protected API routes and protected client routes with automatic session expiration handling.

### 2. Group Projects & Role-Based Permissions
- Create, view, update, and delete group projects with custom color accents and categories (Development, Design, Marketing, Product, Operations, etc.).
- Project membership management: Invite members by email with assigned roles (`admin`, `member`, `viewer`).
- Project sprint progress bars dynamically computed from task completion ratios.

### 3. Interactive Kanban Board & Multiple View Modes
- **Kanban Board View**: Real-time drag-and-drop workflow across 5 standard columns:
  - 📋 **Backlog**
  - 🎯 **To Do**
  - ⚡ **In Progress**
  - 🔍 **In Review**
  - ✅ **Completed**
- **List / Table View**: Sortable and filterable tabular view with direct status changers and action shortcuts.
- **Advanced Filtering**: Live search by task title/description, filter by Status, Priority, and Assignee.

### 4. Task Cards & Assignments
- Create tasks with Title, Description, Status, Priority (`Low`, `Medium`, `High`, `Urgent`), Target Due Date, Assignee, and Tags/Labels.
- Assign tasks to any active project member via dynamic dropdown.
- Overdue warnings and visual indicators for approaching deadlines.

### 5. Task Communication & Real-Time Comments
- Discussion thread on every task card.
- Add and delete comments with user avatars and relative timestamps (`X minutes ago`).
- Audit logging for project activities.

### 6. "My Tasks" Central Dashboard
- A dedicated workspace for users to view, manage, and update all tasks assigned to them across all projects.

### 7. Real-Time Collaboration (Socket.io)
- Real-time task creation, status updates, column movements, deletions, and comments synced live across multiple connected clients without page refreshes.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, date-fns, React Router 6.
- **Backend**: Node.js, Express.js, Socket.io, Mongoose ODM.
- **Database**: MongoDB (supports standard local/remote MongoDB and automatic in-memory fallback for zero-config runs).
- **Authentication**: JWT (JSON Web Tokens) + Bcrypt.js.

---

## 📁 Project Structure

```
CodeAlpha Project Management Tool/
├── server/
│   ├── src/
│   │   ├── config/db.js           # Database connection & fallback
│   │   ├── models/                # Mongoose models (User, Project, Task, Comment, Activity)
│   │   ├── middleware/            # JWT auth & error handling
│   │   ├── controllers/           # Auth, User, Project, Task, Comment controllers
│   │   ├── routes/                # REST API route definitions
│   │   ├── sockets/               # Socket.io real-time connection manager
│   │   ├── seed/seedData.js       # Demo database seeder
│   │   └── server.js              # Express app & HTTP/Socket server
│   ├── tests/api.test.js          # Automated end-to-end API test suite
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/axiosClient.js     # Axios instance with auth interceptors
│   │   ├── context/               # AuthContext, ProjectContext, SocketContext
│   │   ├── components/            # Layout, Board, Project, Task, and Common UI
│   │   ├── pages/                 # Login, Register, Dashboard, ProjectDetail, MyTasks, Team
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json                   # Root scripts to run both client & server concurrently
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (optional - the server will automatically start an in-memory database if MongoDB is not running locally).

---

### Installation

1. Clone or open the repository root:
   ```bash
   cd "CodeAlpha Project Management Tool"
   ```

2. Install dependencies for all packages:
   ```bash
   npm run install:all
   ```
   *(Or individually: `npm install && cd server && npm install && cd ../client && npm install`)*

3. Seed demo data (optional but recommended):
   ```bash
   npm run seed
   ```

---

### Running the Application

To run both the backend API and frontend React app concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Demo Accounts

If you ran `npm run seed`, you can immediately log in with:

| Role | Email | Password |
|---|---|---|
| **Lead Product Manager (Admin)** | `alex@example.com` | `password123` |
| **Senior Engineer (Member)** | `sarah@example.com` | `password123` |
| **UI/UX Designer (Member)** | `david@example.com` | `password123` |

You can also register a brand-new account from the UI anytime.

---

### Running the Test Suite

Run the automated backend test suite verifying authentication, project creation, member invitation, task management, status updates, comments, and authorization checks:

```bash
npm test
```

---

## 🔌 API Endpoints Reference

### Authentication & Users
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate & get JWT token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile details
- `GET /api/users` - List all workspace users
- `GET /api/users/search?q=` - Search users to invite

### Projects
- `GET /api/projects` - Get user's projects with progress stats
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details, members, tasks
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project & cascade tasks/comments
- `POST /api/projects/:id/members` - Invite member by email
- `DELETE /api/projects/:id/members/:userId` - Remove member
- `PATCH /api/projects/:id/members/:userId` - Update member role

### Tasks
- `GET /api/projects/:projectId/tasks` - Get project tasks with filters
- `POST /api/projects/:projectId/tasks` - Create task
- `GET /api/tasks/:id` - Get task detail with comments
- `PUT /api/tasks/:id` - Update task details
- `PATCH /api/tasks/:id/status` - Update task status (board move)
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/my-tasks` - Get tasks assigned to current user

### Comments
- `GET /api/tasks/:taskId/comments` - List task comments
- `POST /api/tasks/:taskId/comments` - Post comment on task
- `DELETE /api/comments/:id` - Delete comment
