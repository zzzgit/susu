import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function normalizeCustomer(row){
	if (!row){ return null }
	return {
		id: String(row.id),
		gender: row.gender ?? '',
		name: row.name,
		phone: row.phone,
		index: row.index ?? '',
		createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
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
	gender, name, phone, index,
}){
	if (!name || !phone){ throw new Error('name and phone are required') }
	const created = await prisma.customer.create({
		data: {
			gender: gender ?? null,
			name,
			phone,
			index: index ?? null,
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
	if (Object.prototype.hasOwnProperty.call(updates, 'index')){ data.index = updates.index ?? null }
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
	gender, name, phone, index,
}){
	const numId = Number(id)
	if (Number.isNaN(numId)){ return null }
	if (!name || !phone){ throw new Error('PUT requires name and phone') }
	const data = {
		gender: gender ?? null,
		name,
		phone,
		index: index ?? null,
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
