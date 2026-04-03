import request from 'supertest'
import { createApp } from '../src/app'
import { prisma } from '../src/config/prisma'

const app = createApp()

const TEST_EMAIL = `test_${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPass123!'

afterAll(async () => {
  // Cleanup test user
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } })
  await prisma.$disconnect()
})

describe('POST /api/v1/auth/register', () => {
  it('returns 201 with tokens on valid data', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(res.status).toBe(201)
    expect(res.body.data).toHaveProperty('accessToken')
    expect(res.body.data).toHaveProperty('refreshToken')
    expect(res.body.data.user).toHaveProperty('email', TEST_EMAIL)
    expect(res.body.data.user).not.toHaveProperty('passwordHash')
  })

  it('returns 409 when email already exists', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(res.status).toBe(409)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 400 with invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: TEST_PASSWORD })

    expect(res.status).toBe(400)
  })

  it('returns 400 with short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'other@example.com', password: 'short' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/auth/login', () => {
  it('returns 200 with tokens on valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('accessToken')
    expect(res.body.data).toHaveProperty('refreshToken')
  })

  it('returns 401 with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPassword!' })

    expect(res.status).toBe(401)
  })

  it('returns 401 with unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: TEST_PASSWORD })

    expect(res.status).toBe(401)
  })
})

describe('Protected routes', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/holdings')
    expect(res.status).toBe(401)
  })

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/holdings')
      .set('Authorization', 'Bearer invalid.token.here')
    expect(res.status).toBe(401)
  })
})
