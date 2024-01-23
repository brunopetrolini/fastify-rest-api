import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { env } from './env'
import { transactionsRoutes } from './application/routes/transactions'
import { loggerMiddy } from './application/middlewares'

const app = fastify()

app.register(cookie)
app.addHook('preHandler', loggerMiddy)
app.register(transactionsRoutes, { prefix: '/transactions' })

app
  .listen({ port: env.PORT })
  .then((address) => console.log(`Server running on: ${address}`))
  .catch(console.error)
