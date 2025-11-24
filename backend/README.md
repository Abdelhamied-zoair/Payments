# C4 Payments Backend

Simple Express + SQLite backend for the C4 Payments project.

## Setup

1. Ensure Node.js is installed.
2. Create `.env` or edit provided values (PORT, JWT_SECRET).
3. Install dependencies:
   - `npm install`
4. Start server:
   - `npm start`

Default admin user is seeded on first run: username `admin`, password `admin123`.

## API

- `GET /health` — service health.
- `POST /auth/login` — returns JWT (body: username, password).
- `GET /suppliers` — list/search suppliers (auth required).
- `POST /suppliers` — create supplier (auth required).
- `PUT /suppliers/:id` — update supplier (auth required).
- `DELETE /suppliers/:id` — delete supplier (auth required).
- `GET /payments` — filter payments (auth required).
- `POST /payments` — add payment (auth required).
- `GET /requests` — search requests (auth required).
- `POST /requests` — add request (auth required).
- `PUT /requests/:id` — update request (auth required).
- `DELETE /requests/:id` — delete request (auth required).