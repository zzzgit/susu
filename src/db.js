import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })

const prisma = new PrismaClient({
	adapter,
	log: [
		{
			emit: 'event',
			level: 'query',
		},
		'info',
		'warn',
		'error',
	],
})

prisma.$on('query', (e)=> {
	console.log('Query: ' + e.query)
	console.log('Params: ' + e.params)
	console.log('Duration: ' + e.duration + 'ms')
})

function normalizeCustomer(row){
	if (!row){ return null }
	return {
		id: String(row.id),
		gender: row.gender ?? '',
		name: row.name,
		phone: row.phone,
		extra: row.extra ?? '',
		createdAt: row.createdAt instanceof Date ? row.createdAt.valueOf() : row.createdAt,
		updatedAt: row.updatedAt instanceof Date ? row.updatedAt.valueOf() : row.updatedAt,
		deletedAt: row.deletedAt instanceof Date ? row.deletedAt.valueOf() : row.deletedAt,
	}
}

export async function getAllCustomers(filters = {}, pagination = {}){
	const where = {
		// 只查詢未刪除的記錄
		deletedAt: null,
	}

	if (filters.name){
		where.name = { contains: filters.name, mode: 'insensitive' }
	}
	if(filters.id){
		where.id = filters.id
	}
	if (filters.gender){
		where.gender = filters.gender
	}
	if (filters.phone){
		where.phone = { contains: filters.phone }
	}
	if (filters.extra){
		where.extra = { contains: filters.extra, mode: 'insensitive' }
	}

	const whereClause = Object.keys(where).length > 0 ? where : undefined

	// 獲取總數
	const total = await prisma.customer.count({ where: whereClause })

	// 分頁查詢
	const { page = 1, pageSize = 10 } = pagination
	const skip = (page - 1) * pageSize

	const rows = await prisma.customer.findMany({
		where: whereClause,
		orderBy: { id: 'asc' },
		skip,
		take: pageSize,
	})

	return {
		data: rows.map(normalizeCustomer),
		pagination: {
			page,
			pageSize,
			total,
			totalPages: Math.ceil(total / pageSize),
		},
	}
}

export async function getCustomerById(id){
	const numId = Number(id)
	if (Number.isNaN(numId)){ return null }
	const row = await prisma.customer.findFirst({
		where: {
			id: numId,
			// 只查詢未刪除的記錄
			deletedAt: null,
		},
	})
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

export function deleteCustomer(id){
	const numId = Number(id)
	if (Number.isNaN(numId)){ return false }
	// 軟刪除：設置 deletedAt 時間戳
	return prisma.customer.updateMany({
		where: {
			id: numId,
			// 只刪除未刪除的記錄
			deletedAt: null,
		},
		data: {
			deletedAt: new Date(),
		},
	}).then(res=> res.count > 0)
}

export function deleteCustomers(ids){
	if (!Array.isArray(ids) || ids.length === 0){ return 0 }
	const numIds = ids.map(id=> Number(id)).filter(id=> !Number.isNaN(id))
	if (numIds.length === 0){ return 0 }
	// 軟刪除：設置 deletedAt 時間戳
	return prisma.customer.updateMany({
		where: {
			id: { in: numIds },
			// 只刪除未刪除的記錄
			deletedAt: null,
		},
		data: {
			deletedAt: new Date(),
		},
	}).then(res=> res.count)
}
