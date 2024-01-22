import { randomUUID } from 'node:crypto'
import { z } from 'zod'

import type { FastifyRequest, FastifyReply } from 'fastify'

import { knex } from '../../infra/database'

export class TransactionsController {
  public async createTransaction(
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

  public async listTransactions() {
    const transactions = await knex('transactions').select('*')
    return { transactions }
  }

  public async getTransaction(request: FastifyRequest) {
    const transactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = transactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions').where({ id }).first()
    return { transaction }
  }

  public async getTransactionsSummary() {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()
    return { summary }
  }
}
