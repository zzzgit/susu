/**
 * 使用 Crockford's Base32 字符集
 */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/**
 * UUIDv7 字符串转 ULID 字符串
 * @param {string} uuid - 符合 RFC 9562 的 UUID 字符串
 * @returns {string} 26位的 ULID 字符串
 */
const uuidToUlid = (uuid)=> {
	// 1. 去掉连字符并转为 Hex
	const hex = uuid.replace(/-/g, '')
	if (hex.length !== 32){ throw new Error('Invalid UUID length') }

	// 2. 将 Hex 转为 BigInt (128位)
	let n = BigInt(`0x${hex}`)

	// 3. 将 BigInt 转为 Base32 (ULID)
	let res = ''
	for (let i = 0; i < 26; i++){
		res = ALPHABET[Number(n % 32n)] + res
		n /= 32n
	}
	return res
}

/**
 * ULID 字符串转 UUIDv7 字符串
 * @param {string} ulid - 26位的 ULID 字符串
 * @returns {string} 标准 UUID 格式字符串
 */
const ulidToUuid = (ulid)=> {
	if (ulid.length !== 26){ throw new Error('Invalid ULID length') }

	// 1. 将 Base32 转回 BigInt
	let n = 0n
	for (const char of ulid.toUpperCase()){
		const value = ALPHABET.indexOf(char)
		if (value === -1){ throw new Error('Invalid ULID character') }
		n = n * 32n + BigInt(value)
	}

	// 2. 转为 32 位 Hex 字符串
	const hex = n.toString(16).padStart(32, '0')

	// 3. 插入连字符符合 UUID 格式 (8-4-4-4-12)
	return [
		hex.substring(0, 8),
		hex.substring(8, 12),
		hex.substring(12, 16),
		hex.substring(16, 20),
		hex.substring(20),
	].join('-')
}

export {
	uuidToUlid,
	ulidToUuid,
}
