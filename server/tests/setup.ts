import dotenv from 'dotenv'
import path from 'path'

// Load test env — falls back to .env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Override with test-safe values if not set
process.env.NODE_ENV = 'test'
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ?? 'test_access_secret_min_32_chars_long_enough'
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? 'test_refresh_secret_min_32_chars_long_enough'
