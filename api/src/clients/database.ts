import { Pool, QueryResult } from 'pg'
import * as env from 'env-var'
import * as util from 'util'
import * as fs from 'fs'

export interface DatabaseClient {
  queryViaFile(path: string, values?: any[]): Promise<QueryResult>
  queryViaText(path: string, values?: any[]): Promise<QueryResult>
  close(): Promise<void>
}

const pool = new Pool({
  connectionString: env.get('DATABASE_URL').required().asString()
})

const readFileAsync = util.promisify(fs.readFile)

const databaseClient: DatabaseClient = {
  queryViaFile: async (path: string, values?: any[]) => {
    const file = await readFileAsync(path)
    return pool.query(file.toString(), values)
  },
  queryViaText: async (text: string, values?: any[]) => {
    return pool.query(text, values)
  },
  close: async () => {
    await pool.end()
  }
}

export default databaseClient
