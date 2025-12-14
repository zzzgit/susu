import fetch from 'node-fetch'
import { getBaseUrl } from './utils.js'

const BASE_URL = getBaseUrl()

export async function testPatchCustomer(id, customerData){
	console.log(`\n=== PATCH /customers/${id} ===`)
	try {
		const res = await fetch(`${BASE_URL}/customers/${id}`, {
			method: 'PATCH',
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
	name: 'updated name',
	phone: '99999999',
}

await testPatchCustomer(1, data)
