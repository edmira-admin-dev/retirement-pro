import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env'
import { globalLimiter } from './middleware/rateLimiter'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes'

export function createApp() {
  const app = express()

  // Trust proxy for accurate rate limiting behind reverse proxy
  app.set('trust proxy', 1)

  // Security middleware
  app.use(helmet())
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))

  // Disable ETags — API responses change dynamically; 304s cause stale data
  app.set('etag', false)

  // Body parsing
  app.use(express.json({ limit: '5mb' }))
  app.use(express.urlencoded({ extended: true }))

  // Rate limiting
  app.use(globalLimiter)

  // API routes
  app.use('/api/v1', routes)

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' })
  })

  // Global error handler (must be last)
  app.use(errorHandler)

  return app
}
