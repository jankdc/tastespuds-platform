import * as Koa from 'koa'

import checkJwt from '../check-jwt'
import * as auth0Users from '../clients/auth0-users'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string'
    },
    username: {
      type: 'string'
    }
  },
  anyOf: [
    { required: ['email'] },
    { required: ['username'] }
  ]
}

async function getUsers(ctx: Koa.Context) {
  const builder: string[] = []

  if (ctx.query.email) {
    builder.push(`email:${ctx.query.email}`)
  }

  if (ctx.query.username) {
    builder.push(`nickname:${ctx.query.username}`)
  }

  ctx.body = await auth0Users.getUsers(builder.join(' AND '))
}

export default [
  checkJwt,
  createValidator(inputSchema),
  getUsers
]
