import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { loggerMiddy } from './middlewares'
import { transactionsRoutes } from './routes/transactions'

const app = fastify()

app.register(cookie)
app.addHook('preHandler', loggerMiddy)
app.register(transactionsRoutes, { prefix: '/transactions' })

export { app }
