Hono Customer API

- Node + Hono
- Stores customers in MySQL via Prisma

Endpoints:
- GET /customers
- GET /customers/:id
- POST /customers  { name, email }
- PUT /customers/:id { name, email }
- PATCH /customers/:id { name?, email? }
- DELETE /customers/:id

Run:
- npm install
- Set DATABASE_URL in .env to your MySQL connection string, e.g.:
  DATABASE_URL="mysql://root:password@127.0.0.1:3306/susu_db"
- npx prisma migrate dev --name init
- npm start
