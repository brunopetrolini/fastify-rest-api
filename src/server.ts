import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { env } from './env'
import { transactionsRoutes } from './application/routes/transactions'

const app = fastify()

app.register(cookie)
app.register(transactionsRoutes, { prefix: '/transactions' })

app
  .listen({ port: env.PORT })
  .then((address) => console.log(`Server running on: ${address}`))
  .catch(console.error)
