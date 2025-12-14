import fetch from 'node-fetch'
import { getBaseUrl } from './utils.js'

const BASE_URL = getBaseUrl()

export async function testDeleteCustomer(id){
	console.log(`\n=== DELETE /customers/${id} ===`)
	try {
		const res = await fetch(`${BASE_URL}/customers/${id}`, {
			method: 'DELETE',
		})
		console.log(`Status: ${res.status}`)
	} catch(error){
		console.log(`Error: ${error.message}`)
	}
}

await testDeleteCustomer(4)
