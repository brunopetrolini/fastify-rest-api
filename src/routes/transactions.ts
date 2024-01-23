import type { FastifyInstance } from 'fastify'
import { checkSessionIdMiddy } from '../middlewares'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../../db'

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    let sessionId = request.cookies.sessionId
    if (!sessionId) {
      sessionId = randomUUID()
      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'debit' ? amount * -1 : amount,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get(
    '/',
    { preHandler: [checkSessionIdMiddy] },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select('*')
      return reply.status(200).send({ transactions })
    },
  )

  app.get('/:id', { preHandler: [checkSessionIdMiddy] }, async (request) => {
    const transactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = transactionParamsSchema.parse(request.params)

    const sessionId = request.cookies.sessionId

    const transaction = await knex('transactions')
      .where({
        id,
        session_id: sessionId,
      })
      .first()
    return { transaction }
  })

  app.get(
    '/summary',
    { preHandler: [checkSessionIdMiddy] },
    async (request) => {
      const sessionId = request.cookies.sessionId

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()
      return { summary }
    },
  )
}
