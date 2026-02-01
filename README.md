# Todo Task Manager

A full-stack task management application built as a production MVP, demonstrating clean architecture, thoughtful design decisions, and modern development practices.

**Author:** John Harbison

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | ASP.NET Core 10, C# |
| Frontend | React 19, TypeScript, Vite |
| UI Library | Material UI (MUI) |
| Data Fetching | TanStack Query (React Query) |
| Authentication | Passwordless email (6-digit code) + JWT |
| Email | [EmailJS](https://www.emailjs.com) (console fallback for dev without public key) |
| Database | SQLite (local) / SQL Server (Docker/Azure) |
| ORM | Entity Framework Core with Migrations |
| Containerization | Docker & Docker Compose |
| Deployment | Local or Docker Compose |

## Project Structure

```
Todo.sln
├── src/
│   ├── TodoApi/              # ASP.NET Core Web API
│   │   ├── Controllers/      # API endpoints (Todo, Auth)
│   │   ├── Data/             # EF Core DbContext & migrations
│   │   ├── Middleware/        # Global error handling
│   │   ├── Models/            # Entity models (TodoItem, User, MagicLinkToken)
│   │   └── Services/          # Business logic (Todo, Auth, Email)
│   ├── TodoApi.Shared/        # DTOs, enums, shared contracts
│   └── todo-frontend/         # React SPA (Vite + TypeScript)
│       └── src/
│           ├── api/           # API client, auth & todo API modules
│           ├── auth/          # AuthContext provider
│           ├── components/    # Shared UI components (TodoCard)
│           ├── pages/         # Route pages (Home, Landing, Login)
│           ├── storage/       # Local storage for anonymous draft todos
│           └── theme/         # MUI theme configuration
├── tests/
│   ├── TodoApi.UnitTests/     # xUnit unit tests (service layer)
│   ├── TodoApi.Tests/         # xUnit integration tests (HTTP pipeline)
│   └── todo-frontend.e2e/     # Playwright E2E tests
└── docker-compose.yml         # Full-stack Docker setup
```

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (optional, for containerized setup)
- [EmailJS account](https://www.emailjs.com) (optional — for real email delivery)

### Option 1: Local Development

**Backend:**
```bash
# 1. Copy the dev config example and fill in your values
cp src/TodoApi/appsettings.Development.json.example src/TodoApi/appsettings.Development.json

# 2. Start the API
cd src/TodoApi
dotnet run
```

> **Dev config:** `appsettings.Development.json` is gitignored. Copy the `.example` file and edit as needed. The app works without it — SQLite is used by default and login codes are logged to the console.
>
> **Email (optional):** To send real login code emails, create a free [EmailJS](https://www.emailjs.com) account and add your keys to `appsettings.Development.json`. Without EmailJS keys, login codes appear in the API console output instead.
The API starts at `http://localhost:5079` with Swagger UI at `http://localhost:5079/swagger`.

**Frontend:**
```bash
cd src/todo-frontend
npm install
npm run dev
```
The frontend starts at `http://localhost:5173`.

### Option 2: Docker Compose (Full Stack)

```bash
docker compose up --build
```

This starts:
- **Frontend** at `http://localhost:3000`
- **API** at `http://localhost:5079`
- **SQL Server** at `localhost:1433`

### Running Tests

```bash
# Frontend unit tests (vitest)
cd src/todo-frontend
npm test

# All backend tests (unit + integration)
dotnet test

# Backend unit tests only
dotnet test tests/TodoApi.UnitTests

# Backend integration tests only
dotnet test tests/TodoApi.Tests

# E2E tests (requires running backend + frontend)
cd tests/todo-frontend.e2e
npm install
npx playwright install chromium
npx playwright test
```

**Test coverage:**

| Suite | Count | What it covers |
|-------|-------|----------------|
| Frontend unit (vitest) | 18 | Date logic: effective horizon promotion, overdue detection, completed filtering |
| Backend unit (xUnit) | 22 | Service layer CRUD, defaults, time horizon, user isolation |
| Backend integration (xUnit) | 32 | HTTP pipeline, auth flow, validation, cross-user isolation |
| E2E (Playwright) | 24 | User flows: anonymous/auth CRUD, tabs, inline edit, priority, Done tab |

## Authentication

The app uses **passwordless email authentication** via 6-digit codes:

1. User enters their email at `/login`
2. API generates a one-time 6-digit code and emails it via [EmailJS](https://www.emailjs.com) (or logs it to the console if no EmailJS key is configured)
3. User enters the code on the same page — no tab switching required
4. Code is exchanged for a JWT, stored in `localStorage`, and attached to all API requests via Axios interceptor
5. JWTs expire after 7 days; login codes expire after 15 minutes and are single-use

**Anonymous users** can create todos in `localStorage`. On sign-in, draft todos are bulk-imported to the API and cleared from local storage.

### Testing Authentication Locally

```bash
# 1. Start the API
cd src/TodoApi && dotnet run

# 2. Request a login code (delivered via email, or check console output)
curl -X POST http://localhost:5079/api/auth/request-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com"}'

# 3. Enter the 6-digit code from your email (or API console)
curl -X POST http://localhost:5079/api/auth/confirm-magic-link \
  -H "Content-Type: application/json" \
  -d '{"token": "123456"}'

# 4. Use the returned JWT for authenticated requests
curl http://localhost:5079/api/todo \
  -H "Authorization: Bearer <jwt-token>"
```

## API Endpoints

### Public (no authentication required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/request-magic-link` | Request a magic link email |
| POST | `/api/auth/confirm-magic-link` | Exchange token for JWT |

### Protected (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todo` | Get all todos for authenticated user |
| GET | `/api/todo/{id}` | Get todo by ID |
| POST | `/api/todo` | Create a todo |
| POST | `/api/todo/bulk` | Bulk create todos (for session import) |
| PUT | `/api/todo/{id}` | Update a todo (partial) |
| DELETE | `/api/todo/{id}` | Delete a todo |

All responses use a consistent `ApiResponse<T>` envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "optional message",
  "errors": null
}
```

### API Request/Response Examples

**Request Magic Link:**
```bash
curl -X POST http://localhost:5079/api/auth/request-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```
```json
{ "success": true, "message": "If that email is registered, a magic link has been sent." }
```

**Confirm Magic Link:**
```bash
curl -X POST http://localhost:5079/api/auth/confirm-magic-link \
  -H "Content-Type: application/json" \
  -d '{"token": "123456"}'
```
```json
{ "success": true, "data": { "token": "eyJhbG...", "email": "user@example.com" } }
```

**Create Todo (authenticated):**
```bash
curl -X POST http://localhost:5079/api/todo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbG..." \
  -d '{"title": "Buy groceries", "priority": 2, "timeHorizon": 0, "category": "Shopping"}'
```
```json
{ "success": true, "data": { "id": 1, "title": "Buy groceries", "status": 0, "priority": 2, "timeHorizon": 0, "category": "Shopping", "createdAt": "...", "updatedAt": "..." }, "message": "Todo item created." }
```

> **`timeHorizon` values:** `0` = Today (default), `1` = Tomorrow, `2` = Someday

**Get All Todos (authenticated):**
```bash
curl http://localhost:5079/api/todo \
  -H "Authorization: Bearer eyJhbG..."
```

**Health Check (public):**
```bash
curl http://localhost:5079/api/health
```
```json
{ "success": true, "data": { "status": "healthy", "timestamp": "2026-01-28T12:00:00Z" } }
```

## Architecture Decisions

- **Passwordless auth**: 6-digit email code flow eliminates password storage and reduces attack surface. JWTs provide stateless authentication. Users stay on the same page throughout login — no tab switching.
- **EmailJS email integration**: Production email delivery via [EmailJS](https://www.emailjs.com). Falls back to console logging when no public key is configured, so the app works out of the box for local dev.
- **Time horizon model (Today / Tomorrow / Someday)**: Instead of date pickers, tasks are bucketed by when they matter. Tomorrow tasks auto-promote to Today when the day rolls over. Completed tasks fade from bucket views at end of day and move to a "Done" archive tab. The UI uses tab filtering, color-coded chips, priority border colors, inline editing, and bucket-aware swipe gestures for at-a-glance triage.
- **Anonymous-to-authenticated migration**: Users can try the app without signing up. Draft todos are stored in `localStorage` and bulk-imported on login.
- **DTOs over entities**: API never exposes EF Core entities directly. Request/response DTOs live in the Shared project.
- **Service layer**: Controllers are thin — business logic lives in services (`TodoService`, `AuthService`), making it testable and maintainable.
- **Global error handling**: Middleware catches unhandled exceptions and returns structured error responses.
- **Dual database support**: SQLite for local development (zero setup), SQL Server for Docker and production via configuration toggle.
- **EF Core migrations**: Database schema is version-controlled and applied on startup.
- **Consistent API responses**: Every endpoint returns `ApiResponse<T>` for predictable frontend consumption.
- **Vite dev proxy**: Frontend proxies `/api` requests to the backend, avoiding CORS issues during local development.
- **CORS configured**: Frontend origin whitelisted for local dev and Docker.

## Trade-offs & Assumptions

- **SQLite for local dev**: Chosen for zero-config setup. SQL Server available via Docker Compose for production parity.
- **No in-memory database**: SQLite with migrations provides reproducibility over in-memory DB.
- **Partial update pattern**: `UpdateTodoItemRequest` uses nullable fields so clients can send only changed properties.
- **JWT in localStorage**: Simple and works for this MVP. For production, consider httpOnly cookies with CSRF protection.
- **Console email fallback**: Without an EmailJS public key, login codes are logged to stdout. Configure EmailJS in `appsettings.Development.json` for real email delivery.

## What I Would Add Next

### Backend & Infrastructure
- **Bulk delete endpoint** (`DELETE /api/todo/all`) — currently clear-all iterates individual deletes client-side
- **Server-side title/description validation** — character limits (120/500) are enforced client-side only
- **Token refresh mechanism** for expired JWTs
- **Rate limiting** on authentication endpoints

### UX & Interaction
- **Undo for completed/deleted tasks** — toast with undo action instead of immediate permanent changes
- **Swipe hint/onboarding** — first-time users don't know swipe gestures exist
- **Drag-and-drop reordering** within and between buckets
- **Bulk selection** — multi-select tasks for batch complete, delete, or move
- **ADA/WCAG 2.2 AA compliance** (keyboard navigation, ARIA labels, color contrast)

### Features
- **Sub-tasks**: Nested tasks with independent status/priority, parent progress ring, auto-complete parent when all children done
- **Recurring tasks** with configurable schedules
- **Labels and tags** for cross-cutting categorization
- **Natural language input** ("Buy groceries tomorrow" auto-sets horizon)
- **Progress tracking and streaks** (daily completion stats)
- **Themes and personalization** (dark mode, accent colors)
- **Search and filter** across all buckets

## License

Private — built for interview demonstration purposes.
