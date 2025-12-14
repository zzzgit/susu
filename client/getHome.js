import fetch from 'node-fetch'
import { getBaseUrl } from './utils.js'

const BASE_URL = getBaseUrl()

export async function testGetHome(){
	console.log('\n=== GET / ===')
	try {
		const res = await fetch(`${BASE_URL}/`)
		console.log(`Status: ${res.status}`)
		const data = await res.text()
		console.log(`Response: ${data}`)
	} catch(error){
		console.log(`Error: ${error.message}`)
	}
}
await testGetHome()
