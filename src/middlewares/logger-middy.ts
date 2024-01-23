import type { FastifyRequest } from 'fastify'

export async function loggerMiddy(request: FastifyRequest) {
  console.info(`[${request.method}] ${request.url}`)
}
