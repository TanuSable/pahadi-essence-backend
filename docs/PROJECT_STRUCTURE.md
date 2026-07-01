# Project Structure

```
src/
├── modules/                        # Feature modules (vertical slices)
│   └── health/
│       ├── controller/             # HTTP handlers
│       ├── service/                # Business logic
│       ├── repository/             # Data access
│       ├── routes/                 # Route definitions
│       ├── dto/                    # Data transfer objects
│       └── health.module.ts        # Module entry point
│
├── shared/                         # Cross-cutting infrastructure
│   ├── config/
│   │   ├── env.ts                  # Zod-validated environment
│   │   ├── database.ts             # MongoDB connection lifecycle
│   │   ├── cloudinary.ts           # Cloudinary SDK config
│   │   └── cors.ts                 # CORS options
│   ├── constants/                  # App-wide constants
│   ├── middleware/
│   │   ├── authentication.middleware.ts
│   │   ├── authorization.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── request-id.middleware.ts
│   │   ├── logger.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   └── rate-limit.middleware.ts
│   ├── utils/
│   │   ├── app-error.ts
│   │   ├── api-response.ts
│   │   └── async-handler.ts
│   ├── validators/                 # Shared Zod schemas
│   ├── helpers/                    # Composed helper functions
│   ├── interfaces/                 # API response contracts
│   ├── types/                      # TypeScript type augmentations
│   ├── lib/                        # Third-party wrappers (future)
│   └── logger/
│       └── logger.ts               # Pino logger instance
│
├── docs/                           # In-repo documentation assets
├── app.ts                          # Express application factory
└── server.ts                       # Process bootstrap & shutdown
```

## Path Aliases

| Alias        | Maps to          |
|--------------|------------------|
| `@/*`        | `src/*`          |
| `@shared/*`  | `src/shared/*`   |
| `@modules/*` | `src/modules/*`  |

## Adding a New Module

1. Create folder under `src/modules/<name>/`
2. Add controller, service, repository, routes, dto
3. Create `<name>.module.ts` that exports a router
4. Mount in `app.ts`: `app.use('/api/v1', <name>Module())`

## What Goes Where

| Need                          | Location                          |
|-------------------------------|-----------------------------------|
| Environment variable          | `shared/config/env.ts`            |
| Reusable middleware           | `shared/middleware/`              |
| Module-specific validation    | `modules/<name>/validators/`      |
| Shared validation (pagination)| `shared/validators/`              |
| API response shape            | `shared/interfaces/`              |
| Business logic                | `modules/<name>/service/`         |
| Database queries              | `modules/<name>/repository/`      |
