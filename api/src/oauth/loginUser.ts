import * as Koa from 'koa'
import * as jwtDecode from 'jwt-decode'
import * as auth0 from '../clients/auth0'
import database from '../clients/database'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    code: {
      type: 'string'
    }
  },
  required: ['code']
}

async function loginUser(ctx: Koa.Context) {
  const { code } = ctx.request.body as any

  const results = await auth0.authenticateUserFromOauth(code)
  const idToken = jwtDecode(results.id_token) as any

  await database.queryViaFile(__dirname + '/loginUser.sql', [idToken.sub])

  ctx.body = results
}

export default [
  createValidator(inputSchema),
  loginUser
]
