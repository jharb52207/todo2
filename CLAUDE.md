# Todo Task Manager — Developer Guide

## Tech Stack

- **Backend:** ASP.NET Core 10, C#, Entity Framework Core
- **Frontend:** React 19, TypeScript, Vite, Material UI, TanStack Query
- **Database:** SQLite (local) / SQL Server (Docker) / InMemory (tests)
- **Testing:** xUnit, WebApplicationFactory, Playwright

## Test-First Development Rules

1. **All code changes must include tests** — no PR merges without test coverage
2. **Tests must pass before commit** — run `dotnet test` before every commit
3. **Coverage goal:** ~100% integration test coverage on all API endpoints
4. **New endpoint checklist:** unit test for service method → integration test for endpoint → verify manually via Swagger

## Testing Strategy

| Layer | Project | Purpose | When to Use |
|-------|---------|---------|-------------|
| **Unit** | `TodoApi.UnitTests` | Service logic in isolation (EF InMemory) | Business logic, edge cases, error paths |
| **Integration** | `TodoApi.Tests` | Full HTTP pipeline via WebApplicationFactory | Endpoint behavior, validation, status codes, serialization |
| **E2E** | `todo-frontend.e2e` | Browser-based flows via Playwright | Critical user journeys, cross-stack verification |

### Running Tests

```bash
# All backend tests
dotnet test

# Unit tests only
dotnet test tests/TodoApi.UnitTests

# Integration tests only
dotnet test tests/TodoApi.Tests

# E2E (requires running stack)
cd tests/todo-frontend.e2e && npx playwright test
```

## Code Patterns

- **Thin controllers** — validation + delegation to service layer, no business logic
- **Service layer** (`ITodoService` / `TodoService`, `IAuthService` / `AuthService`) — all business logic, returns DTOs
- **DTOs** — `CreateTodoItemRequest`, `UpdateTodoItemRequest`, `TodoItemDto`, `AuthDtos` in Shared project
- **ApiResponse envelope** — all endpoints return `ApiResponse<T>` or `ApiResponse`
- **Partial updates** — `UpdateTodoItemRequest` uses nullable fields; service checks `is not null` / `HasValue`
- **User isolation** — all queries filter by `UserId` from JWT claims
- **JWT authentication** — `[Authorize]` on `TodoController`, `[AllowAnonymous]` on health and auth endpoints
- **Magic link auth** — `AuthService` handles user upsert, token generation, JWT issuance
- **Console email service** — `ConsoleEmailService` logs magic links to stdout (swap `IEmailService` for production)
- **Global exception handler** — middleware returns structured `ApiResponse` on unhandled errors

## Common Tasks

### Adding a New Endpoint

1. Add method to `ITodoService` interface
2. Implement in `TodoService`
3. Write unit test in `TodoApi.UnitTests`
4. Add controller action in `TodoController`
5. Write integration test in `TodoApi.Tests`
6. Run `dotnet test` to verify

### Running the Full Stack

```bash
# Local development
cd src/TodoApi && dotnet run          # API at http://localhost:5079
cd src/todo-frontend && npm run dev   # Frontend at http://localhost:5173

# Docker
docker compose up --build             # Frontend :3000, API :5079, SQL Server :1433
```

## Key Files

| File | Purpose |
|------|---------|
| `src/TodoApi/Controllers/TodoController.cs` | Todo CRUD endpoints (JWT-protected) |
| `src/TodoApi/Controllers/AuthController.cs` | Magic link auth endpoints (public) |
| `src/TodoApi/Services/TodoService.cs` | Todo business logic |
| `src/TodoApi/Services/AuthService.cs` | Auth logic: magic links, JWT generation |
| `src/TodoApi/Services/ConsoleEmailService.cs` | Dev email service (logs to console) |
| `src/TodoApi/Middleware/GlobalExceptionHandler.cs` | Error handling |
| `src/TodoApi.Shared/DTOs/` | Request/response contracts |
| `src/todo-frontend/src/auth/AuthContext.tsx` | Frontend auth state + session transfer |
| `src/todo-frontend/src/storage/sessionTodos.ts` | Anonymous session todo storage |
| `tests/TodoApi.UnitTests/` | Unit tests |
| `tests/TodoApi.Tests/` | Integration tests |
| `tests/todo-frontend.e2e/` | E2E tests |
