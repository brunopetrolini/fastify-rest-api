import fastify from 'fastify'

import { env } from './env'
import { transactionsRoutes } from './application/routes/transactions'

const app = fastify()

app.register(transactionsRoutes, { prefix: '/transactions' })

app
  .listen({ port: env.PORT })
  .then((address) => console.log(`Server running on: ${address}`))
  .catch(console.error)
