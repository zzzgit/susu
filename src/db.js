import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString }, { schema: 'myPostgresSchema' })

const prisma = new PrismaClient({
	adapter,
	log: [
		{
			emit: 'stdout',
			level: 'query',
		},
		'info',
		'warn',
	],
})

function normalizeCustomer(row){
	if (!row){ return null }
	return {
		id: String(row.id),
		gender: row.gender ?? '',
		name: row.name,
		phone: row.phone,
		extra: row.extra ?? '',
		createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
		updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
	}
}

export async function getAllCustomers(){
	const rows = await prisma.customer.findMany({ orderBy: { id: 'asc' } })
	return rows.map(normalizeCustomer)
}

export async function getCustomerById(id){
	const numId = Number(id)
	if (Number.isNaN(numId)){ return null }
	const row = await prisma.customer.findUnique({ where: { id: numId } })
	return normalizeCustomer(row)
}

export async function createCustomer({
	gender, name, phone, extra,
}){
	if (!name){ throw new Error('name is required') }
	const created = await prisma.customer.create({
		data: {
			gender: gender ?? null,
			name,
			phone: phone ?? null,
			extra: extra ?? null,
		},
	})
	return normalizeCustomer(created)
}

export async function updateCustomer(id, updates){
	const numId = Number(id)
	if (Number.isNaN(numId)){ return null }
	const data = {}
	if (Object.prototype.hasOwnProperty.call(updates, 'gender')){ data.gender = updates.gender ?? null }
	if (Object.prototype.hasOwnProperty.call(updates, 'name')){ data.name = updates.name }
	if (Object.prototype.hasOwnProperty.call(updates, 'phone')){ data.phone = updates.phone }
	if (Object.prototype.hasOwnProperty.call(updates, 'extra')){ data.extra = updates.extra ?? null }
	try {
		const updated = await prisma.customer.update({ where: { id: numId }, data })
		return normalizeCustomer(updated)
	} catch(e){
		// If not found, Prisma throws; return null
		if (e && e.code === 'P2025'){ return null }
		throw e
	}
}

export async function replaceCustomer(id, {
	gender, name, phone, extra,
}){
	const numId = Number(id)
	if (Number.isNaN(numId)){ return null }
	if (!name){ throw new Error('PUT requires name') }
	const data = {
		gender: gender ?? null,
		name,
		phone: phone ?? null,
		extra: extra ?? null,
	}
	try {
		const replaced = await prisma.customer.update({ where: { id: numId }, data })
		return normalizeCustomer(replaced)
	} catch(e){
		if (e && e.code === 'P2025'){ return null }
		throw e
	}
}

export async function deleteCustomer(id){
	const numId = Number(id)
	if (Number.isNaN(numId)){ return false }
	try {
		await prisma.customer.delete({ where: { id: numId } })
		return true
	} catch(e){
		if (e && e.code === 'P2025'){ return false }
		throw e
	}
}
