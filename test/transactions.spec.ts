import { afterAll, beforeAll, it, describe, expect } from 'vitest'
import request from 'supertest'
import Chance from 'chance'

import { app } from '../src/app'

const chance = new Chance()

describe('Transaction Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  const makeNewTransaction = () => ({
    title: chance.company(),
    amount: chance.integer({ min: 1, max: 10000 }),
    type: chance.pickone(['credit', 'debit']),
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send(makeNewTransaction())
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const transaction = makeNewTransaction()

    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(transaction)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body).toEqual({
      transactions: [
        expect.objectContaining({
          title: transaction.title,
          amount:
            transaction.type === 'credit'
              ? transaction.amount
              : transaction.amount * -1,
        }),
      ],
    })
  })
})
