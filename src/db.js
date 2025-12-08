import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'customers.tsv')

class Mutex{

	constructor(){
		this._locked = false
		this._waiters = []
	}

	lock(){
		return new Promise((resolve)=> {
			if (!this._locked){
				this._locked = true
				resolve(()=> {
					this._locked = false
					if (this._waiters.length){
						this._waiters.shift()()
					}
				})
			} else {
				this._waiters.push(()=> {
					this._locked = true
					resolve(()=> {
						this._locked = false
						if (this._waiters.length){
							this._waiters.shift()()
						}
					})
				})
			}
		})
	}

}

const mutex = new Mutex()

async function ensureDataFile(){
	try {
		await fs.mkdir(DATA_DIR, { recursive: true })
		await fs.access(DATA_FILE)
	} catch {
		// create with header
		const header = 'id\tgender\tname\tphone\tindex\tcreatedAt\n'
		await fs.writeFile(DATA_FILE, header, 'utf8')
	}
}

function parseRows(text){
	const lines = text.split(/\r?\n/).filter(Boolean)
	if (lines.length === 0){ return [] }
	const header = lines[0].split('\t')
	const rows = lines.slice(1).map((line)=> {
		const cols = line.split('\t')
		const obj = {}
		for (const [i, element] of header.entries()){
			obj[element] = cols[i] ?? ''
		}
		// normalize id
		if (obj.id){ obj.id = String(obj.id) }
		return obj
	})
	return rows
}

async function readAll(){
	await ensureDataFile()
	const txt = await fs.readFile(DATA_FILE, 'utf8')
	return parseRows(txt)
}

async function writeAll(rows){
	const header = ['id', 'gender', 'name', 'phone', 'index', 'createdAt']
	const lines = [header.join('\t')]
	for (const r of rows){
		lines.push([r.id, r.gender ?? '', r.name ?? '', r.phone ?? '', r.index ?? '', r.createdAt ?? ''].join('\t'))
	}
	await fs.writeFile(DATA_FILE, lines.join('\n') + '\n', 'utf8')
}

export async function getAllCustomers(){
	return await readAll()
}

export async function getCustomerById(id){
	const rows = await readAll()
	return rows.find(r=> String(r.id) === String(id)) || null
}

export async function createCustomer({
	gender,
	name,
	phone,
	index,
}){
	if (!name || !phone){ throw new Error('name and phone are required') }
	const release = await mutex.lock()
	try {
		const rows = await readAll()
		const ids = rows.map(r=> Number(r.id)).filter(n=> !isNaN(n))
		const nextId = ids.length ? Math.max(...ids) + 1 : 1
		const createdAt = new Date().toISOString()
		const customer = {
			id: String(nextId), gender: gender ?? '', name, phone, index: index ?? '', createdAt,
		}
		rows.push(customer)
		await writeAll(rows)
		return customer
	} finally {
		release()
	}
}

export async function updateCustomer(id, updates){
	const release = await mutex.lock()
	try {
		const rows = await readAll()
		const idx = rows.findIndex(r=> String(r.id) === String(id))
		if (idx === -1){ return null }
		if (updates.gender !== undefined){ rows[idx].gender = updates.gender }
		if (updates.name !== undefined){ rows[idx].name = updates.name }
		if (updates.phone !== undefined){ rows[idx].phone = updates.phone }
		if (updates.index !== undefined){ rows[idx].index = updates.index }
		await writeAll(rows)
		return rows[idx]
	} finally {
		release()
	}
}

// Add a replace function for full (PUT) updates: require both name and phone
export async function replaceCustomer(id, {
	gender,
	name,
	phone,
	index,
}){
	const release = await mutex.lock()
	try {
		const rows = await readAll()
		const idx = rows.findIndex(r=> String(r.id) === String(id))
		if (idx === -1){ return null }
		if (!name || !phone){ throw new Error('PUT requires name and phone') }
		// preserve id and createdAt
		rows[idx] = {
			id: String(rows[idx].id), gender: gender ?? '', name, phone, index: index ?? '', createdAt: rows[idx].createdAt,
		}
		await writeAll(rows)
		return rows[idx]
	} finally {
		release()
	}
}

export async function deleteCustomer(id){
	const release = await mutex.lock()
	try {
		const rows = await readAll()
		const idx = rows.findIndex(r=> String(r.id) === String(id))
		if (idx === -1){ return false }
		rows.splice(idx, 1)
		await writeAll(rows)
		return true
	} finally {
		release()
	}
}
