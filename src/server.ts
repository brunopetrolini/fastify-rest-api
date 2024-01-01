import fastify from 'fastify'

const app = fastify()

app.get('/hello', async () => {
  return 'Hello World!'
})

app
  .listen({ port: 3000 })
  .then((address) => console.log(`Server running on: ${address}`))
  .catch(console.error)
