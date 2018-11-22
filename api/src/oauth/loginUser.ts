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

  ctx.body = results

  const userResult = await database.queryViaFile(__dirname + '/getUser.sql', [
    idToken.sub
  ])

  if (userResult.rowCount > 0) {
    return
  }

  const defaultUsername = idToken.nickname.replace(/[_\W]+/g, '_')
  const usernameResults = await database.queryViaFile(__dirname + '/getUsername.sql', [
    defaultUsername
  ])

  let username = ''

  if (usernameResults.rowCount === 0) {
    username = defaultUsername
  } else {
    username = `${defaultUsername}${Math.ceil(Date.now() / 1000)}`
  }

  await database.queryViaFile(__dirname + '/addUser.sql', [
    idToken.sub,
    idToken.email,
    idToken.picture,
    username
  ])
}

export default [
  createValidator(inputSchema),
  loginUser
]
