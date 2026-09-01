# Team Vault - Frontend Client

This directory contains the production-ready React client application for Team Vault.

---

## Overview

The Team Vault frontend provides an intuitive, responsive interface for managing team workspaces and securely storing credentials. Key interface capabilities include:
- Split-card authentication screens with validation and error feedback.
- Persistent navigation header with user profile identification and mobile drawer.
- Team workspace management sidebar with team creation, join codes, and member management.
- Team secrets vault with category tags (Password, API Key, Note, File Link, Other).
- Secret masking toggle with eye icons and one-click clipboard copying with visual confirmation.
- Responsive pagination controls.

---

## Tech Stack

- **Framework:** React 19 (`react`, `react-dom`)
- **Routing:** React Router v7 (`react-router-dom`)
- **Icons:** Lucide React (`lucide-react`)
- **Styling:** Pure Vanilla CSS (CSS variables, CSS Grid, Flexbox, media queries; no Tailwind or Bootstrap)
- **State Management:** React Context API (`AuthContext`, `TeamContext`, `VaultContext`)
- **HTTP Client:** Native Fetch API client with credentials support (`api/client.js`)

---

## Directory Map

```
client/src/
|-- api/
|   `-- client.js             # Centralized Fetch API client with error handling
|-- components/
|   |-- Navbar.jsx            # Top navigation bar with user avatar & mobile menu
|   `-- ProtectedRoute.jsx    # Route guard redirecting unauthenticated users
|-- context/
|   |-- AuthContext.jsx       # User authentication and session persistence state
|   |-- TeamContext.jsx       # Team workspaces, member management, and join code state
|   `-- VaultContext.jsx      # Secret storage, filtering, and pagination state
|-- pages/
|   |-- Login.jsx             # User login page
|   |-- Register.jsx          # User registration page
|   |-- TeamDashboard.jsx     # Workspace switcher and team overview
|   `-- TeamVault.jsx         # Secrets vault list, creation form, and mask toggles
|-- styles/
|   |-- auth.css              # Styling for login and registration views
|   |-- dashboard.css         # Styling for team dashboard and workspace sidebar
|   |-- globals.css           # Global variables, color tokens, and utility classes
|   |-- layout.css            # Navigation, layout wrappers, and modal windows
|   `-- vault.css             # Secret cards, feed, category badges, and masking
|-- App.js                    # Application router and global context provider wrapper
|-- index.css                 # Base document typography rules
`-- index.js                  # React DOM root entry point
```

---

## Environment Configuration

Configure `REACT_APP_API_URL` in `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

A template file is available at `client/.env.example`.

---

## Available Scripts

In the `client/` directory, you can run:

### `npm start`
Runs the app in development mode on `http://localhost:3000`.

### `npm run build`
Builds the app for production to the `build/` directory with optimized bundles.

### `npm test`
Runs the test runner if tests are defined.

---

## Styling Principles

1. **Design Tokens:** All colors, radius values, shadows, and transitions are defined in `client/src/styles/globals.css` using CSS custom properties (`var(--primary)`, `var(--bg-dark)`, etc.).
2. **Framework Independence:** No external CSS frameworks (Tailwind, Bootstrap) are used.
3. **Accessibility:** All icon buttons include `aria-label` or `title` attributes for screen readers.
