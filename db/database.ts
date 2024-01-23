import { knex as setupKnex, Knex } from 'knex'
import { env } from '../src/env'

export const config: Knex.Config = {
  client: 'sqlite',
  useNullAsDefault: true,
  connection: {
    filename: env.DATABASE_URL,
  },
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
