import fetch from 'node-fetch'
import { getBaseUrl } from './utils.js'

const BASE_URL = getBaseUrl()

export async function testGetCustomerById(id){
	console.log(`\n=== GET /customers/${id} ===`)
	try {
		const res = await fetch(`${BASE_URL}/customers/${id}`)
		console.log(`Status: ${res.status}`)
		const data = await res.json()
		console.log(`Response: ${JSON.stringify(data, null, 2)}`)
		return data
	} catch(error){
		console.log(`Error: ${error.message}`)
	}
}

await testGetCustomerById(1)
