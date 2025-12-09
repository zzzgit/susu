import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { badRequest, created, jsonResponse, notFound } from './handlers.js'
import * as db from './db.js'

const app = new Hono()

app.get('/', c=> c.text('Hono Customer API'))

app.get('/customers', async(_c)=> {
	const rows = await db.getAllCustomers()
	return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } })
})

app.get('/customers/:id', async(c)=> {
	const id = c.req.param('id')
	const customer = await db.getCustomerById(id)
	if (!customer){ return notFound(id) }
	return jsonResponse(customer)
})

app.post('/customers', async(c)=> {
	const body = await c.req.json().catch(()=> null)
	if (!body){ return badRequest('invalid json') }
	const {
		gender,
		name,
		phone,
		extra,
	} = body
	if (!name){ return badRequest('name required') }
	try {
		const createdCustomer = await db.createCustomer({
			gender,
			name,
			phone,
			extra,
		})
		return created(createdCustomer)
	} catch(e){
		return badRequest(e.message)
	}
})

app.put('/customers/:id', async(c)=> {
	const id = c.req.param('id')
	const body = await c.req.json().catch(()=> null)
	if (!body){ return badRequest('invalid json') }
	const {
		gender,
		name,
		phone,
		extra,
	} = body
	try {
		const replaced = await db.replaceCustomer(id, {
			gender,
			name,
			phone,
			extra,
		})
		if (!replaced){ return notFound(id) }
		return jsonResponse(replaced)
	} catch(e){
		return badRequest(e.message)
	}
})

app.patch('/customers/:id', async(c)=> {
	const id = c.req.param('id')
	const body = await c.req.json().catch(()=> null)
	if (!body){ return badRequest('invalid json') }
	// allow partial updates; the db.updateCustomer accepts fields present in body
	const updated = await db.updateCustomer(id, body)
	if (!updated){ return notFound(id) }
	return jsonResponse(updated)
})

app.delete('/customers/:id', async(c)=> {
	const id = c.req.param('id')
	const ok = await db.deleteCustomer(id)
	if (!ok){ return notFound(id) }
	return new Response(null, { status: 204 })
})

serve({ fetch: app.fetch, port: process.env.PORT || 3000 })

console.log('Server running on http://localhost:' + (process.env.PORT || 3000))

export default app
