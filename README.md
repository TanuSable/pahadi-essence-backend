# Pahadi Essence — Backend API

Production-ready REST API foundation for the **Pahadi Essence** premium e-commerce platform.

## Tech Stack

- Node.js + Express.js + TypeScript
- MongoDB + Mongoose
- Pino (structured logging)
- Cloudinary (configuration only)
- Zod validation, Helmet, CORS, Rate Limiting

## Architecture

Layered modular architecture with feature modules and a shared infrastructure layer:

```
Routes → Middleware → Controllers → Services → Repositories → Database
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

## Getting Started

```bash
cp .env.example .env
# Configure MongoDB and Cloudinary credentials

npm install
npm run dev
```

Server starts at `http://localhost:5000` by default.

## Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start dev server with nodemon  |
| `npm run build`| Compile TypeScript to `dist/`  |
| `npm start`    | Run production build           |
| `npm run lint` | Run ESLint                     |
| `npm run format`| Format code with Prettier     |

## API Endpoints

All endpoints are versioned under `/api/v1`:

| Method | Path              | Description   |
|--------|-------------------|---------------|
| GET    | `/api/v1/health`  | Health check  |
| POST   | `/api/v1/auth/register` | Register customer |
| POST   | `/api/v1/auth/login`    | Login (email or phone) |
| POST   | `/api/v1/auth/logout`   | Logout (protected) |
| POST   | `/api/v1/auth/refresh`  | Refresh tokens |
| GET    | `/api/v1/auth/me`       | Current user (protected) |
| POST   | `/api/v1/products`      | Create product (STAFF/SUPER_ADMIN) |
| GET    | `/api/v1/products`      | List products (public) |
| GET    | `/api/v1/products/:id`  | Get product by ID (public) |
| PUT    | `/api/v1/products/:id`  | Update product (STAFF/SUPER_ADMIN) |
| DELETE | `/api/v1/products/:id`  | Delete product (STAFF/SUPER_ADMIN) |
| POST   | `/api/v1/cart/add`          | Add product to cart (AUTH) |
| GET    | `/api/v1/cart`              | Get cart (AUTH) |
| PUT    | `/api/v1/cart/update`       | Update item quantity (AUTH) |
| DELETE | `/api/v1/cart/remove/:id`   | Remove item from cart (AUTH) |
| DELETE | `/api/v1/cart/clear`        | Clear cart (AUTH) |
| POST   | `/api/v1/orders/checkout`   | Place order from cart (AUTH) |
| GET    | `/api/v1/orders`            | List orders (USER / all for STAFF) |
| GET    | `/api/v1/orders/:id`        | Get order by ID (AUTH) |
| PATCH  | `/api/v1/orders/:id/status` | Update order status (STAFF/SUPER_ADMIN) |
| GET    | `/api/v1/admin/dashboard`   | Dashboard analytics (STAFF/SUPER_ADMIN) |
| GET    | `/api/v1/admin/users`       | List users (STAFF/SUPER_ADMIN) |
| PATCH  | `/api/v1/admin/users/:id/role` | Update user role (SUPER_ADMIN only) |
| PATCH  | `/api/v1/admin/users/:id/status` | Block/unblock user (STAFF/SUPER_ADMIN) |
| GET    | `/api/v1/admin/products`    | Admin product list (STAFF/SUPER_ADMIN) |
| PATCH  | `/api/v1/admin/products/:id/stock` | Update stock (STAFF/SUPER_ADMIN) |
| GET    | `/api/v1/admin/orders`        | Admin orders + analytics (STAFF/SUPER_ADMIN) |

## Response Format

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": [] }
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Project Structure](docs/PROJECT_STRUCTURE.md)
- [API Conventions](docs/API_CONVENTIONS.md)
- [Coding Guidelines](docs/CODING_GUIDELINES.md)
