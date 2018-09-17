import { Pool } from 'pg'
import * as env from 'env-var'

const pool = new Pool({
  connectionString: env.get('DATABASE_URL').required().asString()
})

export default pool
