import * as Koa from 'koa'
import * as jwtDecode from 'jwt-decode'
import * as auth0 from '../clients/auth0'
import * as auth0Users from '../clients/auth0-users'
import database from '../clients/database'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    code: {
      type: 'string'
    },
    email: {
      type: 'string'
    }
  },
  required: ['code', 'email']
}

async function loginUser(ctx: Koa.Context) {
  const { code, email } = ctx.request.body as any

  const results = await auth0.authenticateUserFromEmail(email, code)
  const idToken = jwtDecode(results.id_token) as any

  await database.queryViaFile(__dirname + '/loginUser.sql', [idToken.sub])
  const users = await auth0Users.getUsers(`user_id:${idToken.sub}`)

  ctx.body = {
    user: users[0],
    tokens: {
      idToken: results.id_token,
      expiresIn: results.expires_in,
      accessToken: results.access_token,
      refreshToken: results.refresh_token
    }
  }
}

export default [
  createValidator(inputSchema),
  loginUser
]
