import fastify from 'fastify'
import { knex } from './infra/database'

const app = fastify()

app.get('/hello', async () => {
  const tables = await knex('sqlite_schema').select('*')
  return tables
})

app
  .listen({ port: 3000 })
  .then((address) => console.log(`Server running on: ${address}`))
  .catch(console.error)
