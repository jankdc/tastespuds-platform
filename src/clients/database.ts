import { Pool, QueryResult, PoolClient } from 'pg'
import * as util from 'util'
import * as fs from 'fs'

import * as config from '../config'

export interface DatabaseClient {
  createTransaction(task: Task): Promise<void>

  queryClientViaFile(client: PoolClient, path: string, values?: any[]): Promise<QueryResult>
  queryClientViaText(client: PoolClient, text: string, values?: any[]): Promise<QueryResult>

  queryViaFile(path: string, values?: any[]): Promise<QueryResult>
  queryViaText(text: string, values?: any[]): Promise<QueryResult>

  close(): Promise<void>
}

export type Task = (client: PoolClient) => Promise<void>

const pool = new Pool({
  connectionString: config.databaseUrl
})

const readFileAsync = util.promisify(fs.readFile)

const databaseClient: DatabaseClient = {
  createTransaction: async (task) => {
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      await task(client)
      await client.query('COMMIT')
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  },
  queryClientViaFile: async (client, path, values?) => {
    const file = await readFileAsync(path)
    return client.query(file.toString(), values)
  },
  queryClientViaText: async (client, text, values?) => {
    return client.query(text, values)
  },
  queryViaFile: async (path, values?) => {
    const file = await readFileAsync(path)
    return pool.query(file.toString(), values)
  },
  queryViaText: async (text, values?) => {
    return pool.query(text, values)
  },
  close: async () => {
    await pool.end()
  }
}

export default databaseClient
