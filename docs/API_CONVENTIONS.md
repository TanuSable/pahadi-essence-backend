# API Conventions

## Base URL

All APIs are versioned:

```
/api/v1/<resource>
```

## Response Envelope

### Success

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": []
}
```

The `errors` field is optional. When present it may be:
- An array of strings: `["Error detail"]`
- A field map: `{ "email": ["Invalid email format"] }`

## HTTP Status Codes

| Code | Usage                              |
|------|------------------------------------|
| 200  | Successful GET, PUT, PATCH         |
| 201  | Successful POST (resource created) |
| 400  | Bad request / invalid ID format    |
| 401  | Unauthorized (not authenticated) |
| 403  | Forbidden (insufficient permissions)|
| 404  | Resource or route not found        |
| 409  | Conflict (duplicate entry)         |
| 422  | Validation failed                  |
| 500  | Internal server error              |

## Request Headers

| Header           | Description                    |
|------------------|--------------------------------|
| `Content-Type`   | `application/json`             |
| `Authorization`  | Bearer token (future auth)     |
| `X-Request-Id`   | Optional — propagated in logs  |

## Response Headers

| Header           | Description                    |
|------------------|--------------------------------|
| `X-Request-Id`   | Unique request identifier      |

## Health Check Example

**Request:**
```
GET /api/v1/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "uptime": 123.456,
    "timestamp": "2026-07-01T12:00:00.000Z",
    "environment": "development",
    "database": "connected"
  }
}
```

## Controller Pattern

Always use response helpers — never construct JSON manually in controllers:

```typescript
import { sendSuccess } from '@shared/utils/api-response';
import { asyncHandler } from '@shared/utils/async-handler';

export const exampleController = {
  getExample: asyncHandler(async (_req, res) => {
    const data = exampleService.getData();
    sendSuccess(res, 'Example retrieved', data);
  }),
};
```

## Throwing Errors

Use `AppError` for operational failures:

```typescript
throw new AppError('Product not found', 404);
throw new AppError('Validation failed', 422, { name: ['Name is required'] });
```
