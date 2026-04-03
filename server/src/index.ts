import { env } from './config/env'
import { createApp } from './app'
import { prisma } from './config/prisma'

const app = createApp()

async function main() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')

    app.listen(env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${env.PORT}/api/v1`)
      console.log(`   Environment: ${env.NODE_ENV}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

main()
