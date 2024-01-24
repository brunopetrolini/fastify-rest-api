import { execSync } from 'node:child_process'

import { afterAll, beforeAll, it, describe, expect, beforeEach } from 'vitest'
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

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
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

  it('should be able to get a specific transaction', async () => {
    const transaction = makeNewTransaction()

    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(transaction)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body).toEqual({
      transaction: expect.objectContaining({
        title: transaction.title,
        amount:
          transaction.type === 'credit'
            ? transaction.amount
            : transaction.amount * -1,
      }),
    })
  })

  it('should be able to get the summary', async () => {
    const creditTransaction = {
      title: chance.company(),
      amount: chance.integer({ min: 1, max: 10000 }),
      type: 'credit',
    }

    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send(creditTransaction)

    const cookies = createTransactionResponse.get('Set-Cookie')

    const debitTransaction = {
      title: chance.company(),
      amount: chance.integer({ min: 1, max: 10000 }),
      type: 'debit',
    }

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send(debitTransaction)

    const transactionsSummaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    const expectedAmount = creditTransaction.amount - debitTransaction.amount
    expect(transactionsSummaryResponse.body).toEqual({
      summary: { amount: expectedAmount },
    })
  })
})
