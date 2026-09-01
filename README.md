# Team Vault

Team Vault is a secure, role-governed secrets storage and collaborative credential management platform for engineering and operations teams. It enables teams to create isolated workspaces, manage members with role-based permissions, and securely store, categorize, mask, and retrieve sensitive environment variables, passwords, API keys, and notes.

---

## Architecture Overview

Team Vault is architected as a decoupled full-stack application:
- **Client (Frontend):** Modern single-page application built with React 19, vanilla CSS with CSS custom properties (variables), React Router v7, and React Context API for global state management.
- **Server (Backend):** Node.js and Express RESTful API with MongoDB and Mongoose ODM, utilizing JWT stored in httpOnly secure cookies for stateless session validation and role-based access control.

---

## Tech Stack

### Frontend
- **Core:** React 19, React DOM 19
- **Routing:** React Router v7 (`react-router-dom`)
- **State Management:** React Context API (`AuthContext`, `TeamContext`, `VaultContext`)
- **Iconography:** Lucide React (`lucide-react`)
- **Styling:** Pure Vanilla CSS (CSS variables, flexbox, CSS grid, responsive design, no third-party CSS utility frameworks)
- **HTTP Client:** Fetch API client with credentials support (`include`) for httpOnly cookie authentication

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with httpOnly cookies
- **Security:** bcryptjs password hashing, express-rate-limit

---

## Directory Structure

```
Team_Vault/
|-- client/
|   |-- public/
|   |   |-- favicon.ico
|   |   |-- favicon.svg
|   |   |-- index.html
|   |   |-- manifest.json
|   |   `-- robots.txt
|   |-- src/
|   |   |-- api/
|   |   |   `-- client.js
|   |   |-- components/
|   |   |   |-- Navbar.jsx
|   |   |   `-- ProtectedRoute.jsx
|   |   |-- context/
|   |   |   |-- AuthContext.jsx
|   |   |   |-- TeamContext.jsx
|   |   |   `-- VaultContext.jsx
|   |   |-- pages/
|   |   |   |-- Login.jsx
|   |   |   |-- Register.jsx
|   |   |   |-- TeamDashboard.jsx
|   |   |   `-- TeamVault.jsx
|   |   |-- styles/
|   |   |   |-- auth.css
|   |   |   |-- dashboard.css
|   |   |   |-- globals.css
|   |   |   |-- layout.css
|   |   |   `-- vault.css
|   |   |-- App.js
|   |   |-- index.css
|   |   `-- index.js
|   |-- .env.example
|   |-- package.json
|   `-- README.md
|-- docs/
|   |-- API_INTEGRATION.md
|   `-- FRONTEND.md
|-- server/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   |-- package.json
|   `-- server.js
`-- README.md
```

---

## Environment Configuration

### Client Environment (`client/.env`)

Create a `.env` file in the `client/` directory based on `client/.env.example`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

| Variable | Description | Default |
| --- | --- | --- |
| `REACT_APP_API_URL` | Base URL for backend REST API endpoints | `http://localhost:5000/api` |

### Server Environment (`server/.env`)

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/team_vault
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

---

## Installation and Running Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)
- MongoDB instance running locally or via MongoDB Atlas

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Run the Development Servers

```bash
# Start backend server (from /server)
cd server
npm run dev

# Start frontend application (from /client)
cd ../client
npm start
```

The application will be accessible at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

### 3. Production Build

To build the client for production deployment:

```bash
cd client
npm run build
```

The compiled and minified assets will be generated in the `client/build/` directory.

---

## API Integration Summary

| Method | Endpoint | Description | Auth Required | Controller |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | Register a new user account | No | `registerUser` |
| POST | `/api/auth/login` | Log in user and receive httpOnly cookie | No (Rate Limited) | `loginUser` |
| POST | `/api/auth/logout` | Clear user session cookie | No | `logoutUser` |
| GET | `/api/auth/me` | Fetch authenticated user session | Yes | `getMe` |
| POST | `/api/team` | Create a new team workspace | Yes | `createTeam` |
| GET | `/api/team` | List all teams for the logged-in user | Yes | `getUserTeams` |
| GET | `/api/team/:teamId` | Get details and members for a team | Yes | `getTeamById` |
| POST | `/api/team/join` | Join team via invite join code | Yes | `joinTeam` |
| POST | `/api/team/:teamId/add-member` | Add member by email (Owner only) | Yes | `addMember` |
| DELETE | `/api/team/:teamId/remove-member` | Remove member from team (Owner only) | Yes | `removeMember` |
| POST | `/api/team/:teamId/leave` | Leave team (Non-owner member) | Yes | `leaveTeam` |
| DELETE | `/api/team/:teamId` | Delete entire team workspace (Owner only) | Yes | `deleteTeam` |
| POST | `/api/team/:teamId/vault` | Store a new secret / credential | Yes | `postMessage` |
| GET | `/api/team/:teamId/vault` | List secrets with pagination | Yes | `getMessages` |
| GET | `/api/team/:teamId/vault/:vaultId` | Get single secret details | Yes | `getMessage` |
| PUT | `/api/team/:teamId/vault/:vaultId` | Update secret (Author or Owner) | Yes | `updateMessage` |
| DELETE | `/api/team/:teamId/vault/:vaultId` | Delete secret (Author or Owner) | Yes | `deleteMessage` |

---
