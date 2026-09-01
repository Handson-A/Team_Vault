# Frontend Architecture & Component Guide

## Overview

The Team Vault frontend is designed with a component-driven architecture using React 19, Vanilla CSS, and React Context. It provides full responsiveness across desktop, tablet, and mobile breakpoints (1024px, 768px, 640px, 360px).

---

## State Management Architecture

Global state is organized into three dedicated contexts:

### 1. AuthContext (`client/src/context/AuthContext.jsx`)
- Manages user login, registration, logout, and automatic session restoration on app boot via `/api/auth/me`.
- Persists non-sensitive profile info in `localStorage` while securing authentication with httpOnly cookies.

### 2. TeamContext (`client/src/context/TeamContext.jsx`)
- Handles fetching team lists, creating teams, joining teams via 8-character join codes, and member management (add/remove/leave/delete).

### 3. VaultContext (`client/src/context/VaultContext.jsx`)
- Manages secret entries for the active team workspace, including creation, listing with pagination, updating, and deletion.

---

## Page Components

### Login (`client/src/pages/Login.jsx`)
- Split-screen layout: Hero branding banner on the left, authentication form card on the right.
- Client-side validation and inline alert banners with Lucide icons.

### Register (`client/src/pages/Register.jsx`)
- Split-screen registration layout with password confirmation validation.

### TeamDashboard (`client/src/pages/TeamDashboard.jsx`)
- Sidebar workspace selector and team creation/joining modals.
- Team overview header, invite join code banner with one-click copy, and member list.
- Responsive mobile drawer navigation.

### TeamVault (`client/src/pages/TeamVault.jsx`)
- Breadcrumb navigation back to team dashboard.
- Collapsible new secret form supporting categories: Password, API Key, Note, File Link, Other.
- Secret card feed with masking toggles, date metadata, author labels, and clipboard copy buttons.
- Pagination bar supporting multi-page vault navigation.

---

## CSS Design Tokens (`client/src/styles/globals.css`)

```css
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --primary-light: #eef2ff;
  --secondary: #0ea5e9;
  --secondary-hover: #0284c7;
  --accent: #8b5cf6;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --danger-hover: #dc2626;

  --bg-dark: #0f172a;
  --bg-main: #1e293b;
  --bg-card: #334155;
  --bg-card-hover: #3b4d66;
  --bg-input: #1e293b;

  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-inverse: #0f172a;

  --border-color: #475569;
  --border-focus: #6366f1;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}
```

---

## Accessibility Guidelines

- Every interactive button without visible text must have an explicit `aria-label` attribute.
- Interactive states (hover, focus, disabled) are styled with high-contrast outlines and clear visual feedback.
- Form inputs have associated `<label>` tags with matching `htmlFor` and `id` attributes.
