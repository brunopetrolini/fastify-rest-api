import { afterAll, beforeAll, it } from 'vitest'
import request from 'supertest'

import { app } from '../src/app'

beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

it('should create a new transaction', async () => {
  await request(app.server)
    .post('/transactions')
    .send({
      title: 'Salary',
      amount: 3000,
      type: 'credit',
    })
    .expect(201)
})
