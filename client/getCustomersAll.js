import fetch from 'node-fetch'
import { getBaseUrl } from './utils.js'

const BASE_URL = getBaseUrl()

export async function testGetAllCustomers(){
	console.log('\n=== GET /customers ===')
	try {
		const res = await fetch(`${BASE_URL}/customers`)
		console.log(`Status: ${res.status}`)
		const data = await res.json()
		console.log(`Response: ${JSON.stringify(data, null, 2)}`)
		return data
	} catch(error){
		console.log(`Error: ${error.message}`)
	}
}

await testGetAllCustomers()
