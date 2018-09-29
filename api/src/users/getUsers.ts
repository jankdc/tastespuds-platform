import * as Koa from 'koa'
import * as auth0Users from '../clients/auth0-users'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string'
    }
  },
  required: ['email']
}

async function getUsers(ctx: Koa.Context) {
  const { email } = ctx.query

  ctx.body = {
    users: await auth0Users.getUsers(`email:${email}`)
  }
}

export default [
  createValidator(inputSchema),
  getUsers
]
