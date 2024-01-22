import fastify from 'fastify'
import { knex } from './infra/database'
import { randomUUID } from 'node:crypto'
import { env } from './env'

const app = fastify()

app.get('/hello', async () => {
  const transaction = await knex('transactions')
    .insert({
      id: randomUUID(),
      title: 'Test transaction',
      amount: 100,
    })
    .returning('*')
  return transaction
})

app
  .listen({ port: env.PORT })
  .then((address) => console.log(`Server running on: ${address}`))
  .catch(console.error)
