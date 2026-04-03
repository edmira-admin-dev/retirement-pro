import request from 'supertest'
import { createApp } from '../src/app'
import { prisma } from '../src/config/prisma'

const app = createApp()

const TEST_EMAIL = `holdings_${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPass123!'

let accessToken: string

beforeAll(async () => {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
  accessToken = res.body.data.accessToken
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: TEST_EMAIL } })
  await prisma.$disconnect()
})

describe('GET /api/v1/holdings', () => {
  it('returns 200 with empty array for new user', async () => {
    const res = await request(app)
      .get('/api/v1/holdings')
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/holdings')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/v1/holdings', () => {
  let createdId: string

  it('creates a holding and returns 201', async () => {
    const res = await request(app)
      .post('/api/v1/holdings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Parag Parikh Flexi Cap',
        assetClass: 'MF',
        currentValue: 5000000, // ₹50,000 in paise
        investedValue: 4000000,
        units: 142.5,
        nav: 351.23,
      })

    expect(res.status).toBe(201)
    expect(res.body.data).toHaveProperty('id')
    expect(res.body.data.name).toBe('Parag Parikh Flexi Cap')
    expect(res.body.data.currentValue).toBe(5000000)
    createdId = res.body.data.id
  })

  it('returns 400 with missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/holdings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Incomplete' })

    expect(res.status).toBe(400)
  })

  it('returns 400 with invalid assetClass', async () => {
    const res = await request(app)
      .post('/api/v1/holdings')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Test',
        assetClass: 'INVALID',
        currentValue: 100,
        investedValue: 100,
      })

    expect(res.status).toBe(400)
  })

  it('updates a holding with PATCH', async () => {
    const res = await request(app)
      .patch(`/api/v1/holdings/${createdId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentValue: 6000000 })

    expect(res.status).toBe(200)
    expect(res.body.data.currentValue).toBe(6000000)
  })

  it('soft-deletes a holding', async () => {
    const res = await request(app)
      .delete(`/api/v1/holdings/${createdId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(204)

    // Verify it no longer appears in list
    const listRes = await request(app)
      .get('/api/v1/holdings')
      .set('Authorization', `Bearer ${accessToken}`)

    const ids = listRes.body.data.map((h: { id: string }) => h.id)
    expect(ids).not.toContain(createdId)
  })
})
