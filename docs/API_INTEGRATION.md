# API Integration Guide

## Overview

The client uses a unified Fetch API client wrapper defined in `client/src/api/client.js`. All requests pass credentials (`credentials: 'include'`) to allow the browser to manage JWT authentication cookies seamlessly.

---

## Endpoint Mapping

### Authentication Routes (`/api/auth`)

| Endpoint | Method | Payload | Description |
| --- | --- | --- | --- |
| `/api/auth/register` | POST | `{ username, email, password }` | Creates a new user profile and sets auth cookie. |
| `/api/auth/login` | POST | `{ email, password }` | Authenticates credentials and sets auth cookie. |
| `/api/auth/logout` | POST | `{}` | Clears auth cookie on the server. |
| `/api/auth/me` | GET | None | Validates active cookie and returns user object. |

### Team Management Routes (`/api/team`)

| Endpoint | Method | Payload | Description |
| --- | --- | --- | --- |
| `/api/team` | POST | `{ name, description }` | Creates a team workspace and generates join code. |
| `/api/team` | GET | None | Retrieves all teams the authenticated user belongs to. |
| `/api/team/:teamId` | GET | None | Retrieves team details, owner info, and member list. |
| `/api/team/join` | POST | `{ joinCode }` | Adds authenticated user to team via 8-char code. |
| `/api/team/:teamId/add-member` | POST | `{ email }` | Adds a member by email (Owner only). |
| `/api/team/:teamId/remove-member` | DELETE | `{ userId }` | Removes a member from the team (Owner only). |
| `/api/team/:teamId/leave` | POST | `{}` | Removes the authenticated user from the team. |
| `/api/team/:teamId` | DELETE | None | Deletes team and associated secrets (Owner only). |

### Team Vault Routes (`/api/team/:teamId/vault`)

| Endpoint | Method | Payload | Description |
| --- | --- | --- | --- |
| `/api/team/:teamId/vault` | POST | `{ title, category, content }` | Stores a new secret in the team vault. |
| `/api/team/:teamId/vault` | GET | Query params: `?page=1&limit=25` | Lists paginated team secrets. |
| `/api/team/:teamId/vault/:vaultId` | GET | None | Retrieves a single secret entry. |
| `/api/team/:teamId/vault/:vaultId` | PUT | `{ title, category, content }` | Updates secret (Author or Team Owner). |
| `/api/team/:teamId/vault/:vaultId` | DELETE | None | Deletes secret (Author or Team Owner). |

---

## Error Handling

The client wrapper intercepts responses:
- `401 Unauthorized`: Automatically cleans up `localStorage` user cache and redirects to `/login`.
- Non-OK responses: Parses error JSON (`data.message` or `data.msg`) and throws a typed Error object consumed by React Context error handlers.
