import { FastifyInstance } from 'fastify'

import { TransactionsController } from '../controllers'

export async function transactionsRoutes(app: FastifyInstance) {
  const transactionController = new TransactionsController()
  app.post('/', transactionController.createTransaction)
  app.get('/', transactionController.listTransactions)
  app.get('/:id', transactionController.getTransaction)
  app.get('/summary', transactionController.getTransactionsSummary)
}
