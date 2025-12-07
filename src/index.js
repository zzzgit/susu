import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { jsonResponse, notFound, badRequest, created } from './handlers.js';
import * as db from './db.js';

const app = new Hono();

app.get('/', (c) => c.text('Hono Customer API'));

app.get('/customers', async (c) => {
  const rows = await db.getAllCustomers();
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
});

app.get('/customers/:id', async (c) => {
  const id = c.req.param('id');
  const customer = await db.getCustomerById(id);
  if (!customer) return notFound(id);
  return jsonResponse(customer);
});

app.post('/customers', async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return badRequest('invalid json');
  const { name, email } = body;
  if (!name || !email) return badRequest('name and email required');
  try {
    const createdCustomer = await db.createCustomer({ name, email });
    return created(createdCustomer);
  } catch (e) {
    return badRequest(e.message);
  }
});

app.put('/customers/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => null);
  if (!body) return badRequest('invalid json');
  const { name, email } = body;
  try {
    const replaced = await db.replaceCustomer(id, { name, email });
    if (!replaced) return notFound(id);
    return jsonResponse(replaced);
  } catch (e) {
    return badRequest(e.message);
  }
});

app.patch('/customers/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => null);
  if (!body) return badRequest('invalid json');
  const updated = await db.updateCustomer(id, body);
  if (!updated) return notFound(id);
  return jsonResponse(updated);
});

app.delete('/customers/:id', async (c) => {
  const id = c.req.param('id');
  const ok = await db.deleteCustomer(id);
  if (!ok) return notFound(id);
  return new Response(null, { status: 204 });
});

const server = serve({ fetch: app.fetch, port: process.env.PORT || 3000 });

console.log('Server running on http://localhost:' + (process.env.PORT || 3000));

export default app;
