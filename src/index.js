import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { badRequest, created, jsonResponse, notFound } from './handlers.js'
import * as db from './db.js'
import { cors } from 'hono/cors'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { ulidToUuid, uuidToUlid } from './utils.js'

const app = new Hono()
app.use('*', trimTrailingSlash())
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
	if (id){
		filters.id = ulidToUuid(id)
	}

	// 分頁參數，單數一個函數進行解析
	const page = parseInt(c.req.query('page')) || 1
	const pageSize = parseInt(c.req.query('pageSize')) || 10
	const pagination = { page, pageSize }

	const result = await db.getAllCustomers(filters, pagination)
	// 轉換出參中的 id 為 ULID
	const transformedResult = {
		...result,
		data: result.data.map(customer=> ({
			...customer,
			id: uuidToUlid(customer.id),
		})),
	}
	return new Response(JSON.stringify(transformedResult), { headers: { 'Content-Type': 'application/json' } })
})

app.get(`${apiVersion}/customers/:id`, async(c)=> {
	const ulid = c.req.param('id')
	let id
	try {
		id = ulidToUuid(ulid)
	} catch{
		id = ulid
	}
	const customer = await db.getCustomerById(id)
	if (!customer){ return notFound(ulid) }
	// 轉換出參中的 id 為 ULID
	const transformedCustomer = {
		...customer,
		id: uuidToUlid(customer.id),
	}
	return jsonResponse(transformedCustomer)
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
		const transformedCustomer = {
			...createdCustomer,
			id: uuidToUlid(createdCustomer.id),
		}
		return created(transformedCustomer)
	} catch(e){
		return badRequest(e.message)
	}
})

app.put(`${apiVersion}/customers/:id`, async(c)=> {
	const ulid = c.req.param('id')
	let id
	try {
		id = ulidToUuid(ulid)
	} catch{
		id = ulid
	}
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
		if (!replaced){ return notFound(ulid) }
		// 轉換出參中的 id 為 ULID
		const transformedCustomer = {
			...replaced,
			id: uuidToUlid(replaced.id),
		}
		return jsonResponse(transformedCustomer)
	} catch(e){
		return badRequest(e.message)
	}
})

app.patch(`${apiVersion}/customers/:id`, async(c)=> {
	const ulid = c.req.param('id')
	let id
	try {
		id = ulidToUuid(ulid)
	} catch{
		id = ulid
	}
	const body = await c.req.json().catch(()=> null)
	if (!body){ return badRequest('invalid json') }
	// allow partial updates; the db.updateCustomer accepts fields present in body
	const updated = await db.updateCustomer(id, body)
	if (!updated){ return notFound(ulid) }
	// 轉換出參中的 id 為 ULID
	const transformedCustomer = {
		...updated,
		id: uuidToUlid(updated.id),
	}
	return jsonResponse(transformedCustomer)
})

app.delete(`${apiVersion}/customers`, async(c)=> {
	const body = await c.req.json().catch(()=> null)
	if (!body){ return badRequest('invalid json') }

	const { ids } = body
	if (!ids || !Array.isArray(ids) || ids.length === 0){
		return badRequest('ids array required')
	}

	// 轉換 ULID 入參為 UUID
	const convertedIds = ids.map((ulid)=> {
		try {
			const uuid = ulidToUuid(ulid)
			return uuid
		} catch(e){
			return ulid
		}
	})
	const deletedCount = await db.deleteCustomers(convertedIds)
	return jsonResponse({
		deleted: deletedCount,
		message: `Successfully deleted ${deletedCount} customer(s)`,
	})
})

app.delete(`${apiVersion}/customers/:id`, async(c)=> {
	const ulid = c.req.param('id')
	let id
	try {
		id = ulidToUuid(ulid)
	} catch{
		id = ulid
	}
	const ok = await db.deleteCustomer(id)
	if (!ok){ return notFound(ulid) }
	return new Response(null, { status: 204 })
})

serve({ fetch: app.fetch, port: process.env.PORT || 3000 })

console.log('Server running on http://localhost:' + (process.env.PORT || 3000))

export default app
