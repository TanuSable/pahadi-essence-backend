# Architecture

## Overview

Pahadi Essence backend follows a **Layered Modular Architecture** — not traditional MVC. Each feature is a self-contained vertical slice, while cross-cutting concerns live in `shared/`.

## Request Flow

```
Client Request
    ↓
Security Middleware (Helmet, CORS, Rate Limit)
    ↓
Request ID + HTTP Logger (Pino)
    ↓
Route Matcher (/api/v1/*)
    ↓
Module Middleware (auth, validation — when applicable)
    ↓
Controller (thin — HTTP in/out only)
    ↓
Service (business logic)
    ↓
Repository (database operations)
    ↓
MongoDB
```

On error, control flows to the global error middleware which returns a standardized JSON envelope.

## Layer Responsibilities

| Layer        | Responsibility                                      | Must NOT do                    |
|--------------|-----------------------------------------------------|--------------------------------|
| Routes       | Map HTTP paths to controllers                       | Business logic                 |
| Middleware   | Cross-cutting concerns (auth, validation, logging)  | Domain rules                   |
| Controller   | Parse request, call service, send response          | Database queries, business rules |
| Service      | Business logic, orchestration                       | Direct HTTP handling           |
| Repository   | CRUD and query operations                           | Business decisions             |
| Model        | Schema, indexes, virtuals                           | API logic                      |

## Module Pattern

Each feature module (e.g. `health/`) owns:

```
module/
├── controller/
├── service/
├── repository/
├── routes/
├── dto/
└── module.ts          # Wires routes and exports router
```

Modules are mounted in `app.ts` under `/api/v1`.

## Shared Layer

`shared/` contains infrastructure used across all modules:

- **config/** — Environment, database, third-party SDK setup
- **middleware/** — Generic reusable middleware
- **utils/** — Pure helper functions (AppError, asyncHandler, api-response)
- **logger/** — Centralized Pino logger
- **constants/**, **types/**, **interfaces/** — Shared definitions

## Design Decisions

### Fail-fast configuration
All environment variables are validated with Zod at startup. The process exits immediately if configuration is invalid.

### Standardized API envelope
Every response uses `{ success, message, data/errors }` so the frontend can handle all endpoints uniformly.

### Operational vs programmer errors
`AppError` represents expected failures (404, 422). Unexpected errors return 500 with no stack trace in production.

### Graceful shutdown
`SIGTERM` and `SIGINT` trigger an orderly shutdown: stop accepting connections → close MongoDB → exit.

### Request tracing
Every request gets an `X-Request-Id` header, propagated through logs for debugging and observability.

## Future Modules

Business modules (auth, products, orders, etc.) will be added as independent slices under `modules/` without modifying the shared foundation.
