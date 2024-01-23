import type { FastifyInstance } from 'fastify'

import { TransactionsController } from '../controllers'
import { checkSessionIdMiddy } from '../middlewares'

export async function transactionsRoutes(app: FastifyInstance) {
  const transactionController = new TransactionsController()
  app.post('/', transactionController.createTransaction)
  app.get(
    '/',
    { preHandler: [checkSessionIdMiddy] },
    transactionController.listTransactions,
  )
  app.get(
    '/:id',
    { preHandler: [checkSessionIdMiddy] },
    transactionController.getTransaction,
  )
  app.get(
    '/summary',
    { preHandler: [checkSessionIdMiddy] },
    transactionController.getTransactionsSummary,
  )
}
