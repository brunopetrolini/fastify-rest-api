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
  }

  public async listTransactions(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<FastifyReply> {
    const sessionId = request.cookies.sessionId

    const transactions = await knex('transactions')
      .where('session_id', sessionId)
      .select('*')
    return reply.status(200).send({ transactions })
  }

  public async getTransaction(request: FastifyRequest) {
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
  }

  public async getTransactionsSummary(request: FastifyRequest) {
    const sessionId = request.cookies.sessionId

    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first()
    return { summary }
  }
}
