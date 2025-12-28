import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { badRequest, created, jsonResponse, notFound } from './handlers.js'
import * as db from './db.js'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/api/*', cors())

const apiVersion = '/api/v1'

app.get('/', c=> c.text('Hono  '))
app.get(`${apiVersion}/`, c=> c.text('Hono Customer API'))

app.get(`${apiVersion}/customers`, async(c)=> {
	const filters = {}
	const name = c.req.query('name')
	const gender = c.req.query('gender')
	const phone = c.req.query('phone')
	const id = c.req.query('id')
	const extra = c.req.query('extra')

	if (name){ filters.name = name }
	if (gender){ filters.gender = gender }
	if (phone){ filters.phone = phone }
	if (extra){ filters.extra = extra }
	if (id){ filters.id = +id }

	// 分頁參數，單數一個函數進行解析
	const page = parseInt(c.req.query('page')) || 1
	const pageSize = parseInt(c.req.query('pageSize')) || 10
	const pagination = { page, pageSize }

	const result = await db.getAllCustomers(filters, pagination)
	return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
})

app.get(`${apiVersion}/customers/:id`, async(c)=> {
	const id = c.req.param('id')
	const customer = await db.getCustomerById(id)
	if (!customer){ return notFound(id) }
	return jsonResponse(customer)
})

app.post(`${apiVersion}/customers`, async(c)=> {
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

app.put(`${apiVersion}/customers/:id`, async(c)=> {
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

app.patch(`${apiVersion}/customers/:id`, async(c)=> {
	const id = c.req.param('id')
	const body = await c.req.json().catch(()=> null)
	if (!body){ return badRequest('invalid json') }
	// allow partial updates; the db.updateCustomer accepts fields present in body
	const updated = await db.updateCustomer(id, body)
	if (!updated){ return notFound(id) }
	return jsonResponse(updated)
})

app.delete(`${apiVersion}/customers/:id`, async(c)=> {
	const id = c.req.param('id')
	const ok = await db.deleteCustomer(id)
	if (!ok){ return notFound(id) }
	return new Response(null, { status: 204 })
})

serve({ fetch: app.fetch, port: process.env.PORT || 3000 })

console.log('Server running on http://localhost:' + (process.env.PORT || 3000))

export default app
