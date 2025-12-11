# Hono Customer API

- Node + Hono
- Stores customers in MySQL via Prisma

## Endpoints
- GET /customers
- GET /customers/:id
- POST /customers  { name, email }
- PUT /customers/:id { name, email }
- PATCH /customers/:id { name?, email? }
- DELETE /customers/:id

## Prerequisites
- Node.js and npm
- MySQL server
- A `.env` file at project root with:

  DATABASE_URL="mysql://user:password@host:port/database"

## Install
- npm install

## package.json scripts
The project provides several npm scripts to manage Prisma and run the app:

- npm run prisma:generate
  - Runs `prisma generate --schema=prisma/schema.prisma` to generate the Prisma Client based on `prisma/schema.prisma`. Run this after changing the schema or after pulling the repo.

- npm run prisma:migrate
  - Runs `prisma migrate dev --schema=prisma/schema.prisma` to create/apply a development migration and update the database schema. Use this to create the initial tables (for example: `npm run prisma:migrate -- --name init`).

- npm run prisma:studio
  - Runs `prisma studio --schema=prisma/schema.prisma` to open Prisma Studio, a web UI for browsing and editing your database.

- npm run prisma:reset
  - Runs `prisma migrate reset --schema=prisma/schema.prisma --force` to reset the database and migrations (drops all data and reapplies migrations). This is destructive — use only in development and with caution.

- npm start
  - Runs the app: `node src/index.js` (starts the Hono REST API server).

Notes:
- Prisma v7 uses `prisma.config.ts` for datasource configuration. The project loads environment variables via `dotenv` so `.env` is read automatically when running Prisma CLI commands.
- If a Prisma command complains about missing env vars, ensure you run it from the project root where `.env` exists.

## Typical workflow
1. Ensure `.env` contains a valid `DATABASE_URL`.
2. npm install
3. npm run prisma:generate
4. npm run prisma:migrate -- --name init
5. npm run prisma:studio (optional)
6. npm start

## Run directly via npx (alternatives)
- npx prisma generate --schema=prisma/schema.prisma
- npx prisma migrate dev --schema=prisma/schema.prisma --name init
- npx prisma studio --schema=prisma/schema.prisma

## Running the server
- npm start
