import fetch from 'node-fetch'
import { getBaseUrl } from './utils.js'

const BASE_URL = getBaseUrl()

export async function testReplaceCustomer(id, customerData){
	console.log(`\n=== PUT /customers/${id} ===`)
	try {
		const res = await fetch(`${BASE_URL}/customers/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(customerData),
		})
		console.log(`Status: ${res.status}`)
		const data = await res.json()
		console.log(`Response: ${JSON.stringify(data, null, 2)}`)
		return data
	} catch(error){
		console.log(`Error: ${error.message}`)
	}
}

const data = {
	name: 'replaced name',
	phone: '88888888',
	extra: 'replaced customer',
	gender: 'M',
}

await testReplaceCustomer(1, data)
