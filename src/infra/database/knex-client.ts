import { knex as setupKnex, Knex } from 'knex'

export const config: Knex.Config = {
  client: 'sqlite',
  useNullAsDefault: true,
  connection: {
    filename: './src/infra/database/app.db',
  },
  migrations: {
    extension: 'ts',
    directory: './src/infra/database/migrations',
  },
}

export const knex = setupKnex(config)
