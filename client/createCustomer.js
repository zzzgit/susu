import fetch from 'node-fetch'
import { getBaseUrl } from './utils.js'

const BASE_URL = getBaseUrl()

const testCreateCustomer = async(customerData)=> {
	console.log('\n=== POST /customers ===')
	try {
		const res = await fetch(`${BASE_URL}/customers`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(customerData),
		})
		console.log(`Status: ${res.status}`)
		const data = await res.json()
		console.log(`Created Customer: ${JSON.stringify(data, null, 2)}`)
		return data
	} catch(error){
		console.log(`Error: ${error.message}`)
	}
}

const data = {
	name: 'ma xin',
	phone: '33333333',
	extra: 'test customer',
	gender: 'F',
}

testCreateCustomer(data)
