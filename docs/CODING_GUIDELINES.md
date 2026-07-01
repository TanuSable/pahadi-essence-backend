# Coding Guidelines

## General Principles

1. **Thin controllers** — Parse input, call service, return response. Nothing else.
2. **Fat services** — Business logic lives here.
3. **Dumb repositories** — Only database operations. No business rules.
4. **No duplicated code** — Extract to `shared/utils/` or `shared/helpers/`.
5. **Strict TypeScript** — No `any`. Enable all strict compiler options.

## Naming Conventions

| Artifact     | Convention              | Example                    |
|--------------|-------------------------|----------------------------|
| Files        | kebab-case              | `health.controller.ts`     |
| Classes      | PascalCase              | `AppError`                 |
| Functions    | camelCase               | `connectDatabase`          |
| Constants    | UPPER_SNAKE_CASE        | `API_VERSION`              |
| Interfaces   | PascalCase              | `ApiSuccessResponse`       |
| DTOs         | PascalCase + `Dto`      | `HealthDataDto`            |

## Imports

Use path aliases — avoid deep relative imports:

```typescript
// Good
import { env } from '@shared/config/env';
import { healthService } from '@modules/health/service/health.service';

// Avoid
import { env } from '../../../shared/config/env';
```

## Error Handling

- Wrap async route handlers with `asyncHandler`
- Throw `AppError` for expected failures
- Never catch errors silently in controllers — let the global error middleware handle them
- Never expose stack traces in production

## Logging

- Use the centralized Pino logger from `@shared/logger/logger`
- Include `requestId` in error logs when available
- Do not use `console.log` in application code

## Validation

- Use Zod schemas with the `validate` middleware
- Module-specific schemas live in the module
- Shared schemas (pagination, ObjectId) live in `shared/validators/`

## Environment Variables

- All env vars must be declared in `shared/config/env.ts`
- Never access `process.env` directly outside the config module
- Update `.env.example` when adding new variables

## Module Checklist

When creating a new module:

- [ ] `dto/` — Request/response types
- [ ] `repository/` — Database operations
- [ ] `service/` — Business logic
- [ ] `controller/` — HTTP handlers with `asyncHandler`
- [ ] `routes/` — Express router
- [ ] `<name>.module.ts` — Export and mount routes
- [ ] Register in `app.ts`

## Security

- All routes pass through Helmet, CORS, rate limiting, mongo-sanitize, and HPP
- Authentication middleware is a placeholder — wire it when the auth module is built
- Never commit `.env` files or secrets

## Testing (Future)

- Unit test services and utilities
- Integration test routes against the Express app (without starting a real server)
- Use `app.ts` export for testability
