// Write your tests here
const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})

beforeEach(async () => {
  await db('users').truncate()
})

afterAll(async () => {
  await db.destroy()
})

describe('[POST] /api/auth/register', () => {
  test('registers new user and returns the saved user', async () => {
    const res = await request(server)
    .post('/api/auth/register')
    .send({ username: 'Spidey', password: 'webhead'})

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('username', 'Spidey')
  })

  test('fails and returns missing credentials message', async () => {
    const res = await request(server)
    .post('/api/auth/register')
    .send({})

    expect(res.status).toBe(400)
    expect(res.body.message).toBe('username and password required')
  })
})

describe('[POST] /api/auth/login', () => {
  beforeEach(async () => {
    await request(server)
      .post('/api/auth/register')
      .send({ username: 'Tony', password: 'jarvis'})
  })

  test('logs in and returns the token', async () => {
    const res = await request(server)
    .post('/api/auth/login')
    .send({ username: 'Tony', password: 'jarvis'})

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('message', 'welcome, Tony')
    expect(res.body).toHaveProperty('token')
  })

  test('fails when incorrect password is entered', async () => {
    const res = await request(server)
    .post('/api/auth/login')
    .send({ username: 'Tony', password: 'jarrrvis'})

    expect(res.status).toBe(401)
    expect(res.body.message).toBe('invalid credentials')
  })
})
