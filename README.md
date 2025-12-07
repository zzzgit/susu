Hono Customer API

- Node + Hono
- Stores customers in data/customers.tsv

Endpoints:
- GET /customers
- GET /customers/:id
- POST /customers  { name, email }
- PUT /customers/:id { name, email }
- PATCH /customers/:id { name?, email? }
- DELETE /customers/:id

Run:
- npm install
- npm start
