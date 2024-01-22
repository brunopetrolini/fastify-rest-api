import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

import { knex } from '../../infra/database'

async function createTransaction(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<FastifyReply> {
  const createTransactionBodySchema = z.object({
    title: z.string(),
    amount: z.number(),
    type: z.enum(['credit', 'debit']),
  })

  const { title, amount, type } = createTransactionBodySchema.parse(
    request.body,
  )

  await knex('transactions').insert({
    id: randomUUID(),
    title,
    amount: type === 'debit' ? amount * -1 : amount,
  })

  return reply.status(201).send()
}

async function listTransactions() {
  const transactions = await knex('transactions').select('*')
  return { transactions }
}

async function getTransaction(request: FastifyRequest) {
  const transactionParamsSchema = z.object({
    id: z.string().uuid(),
  })

  const { id } = transactionParamsSchema.parse(request.params)

  const transaction = await knex('transactions').where({ id }).first()
  return { transaction }
}

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', createTransaction)
  app.get('/', listTransactions)
  app.get('/:id', getTransaction)
}
