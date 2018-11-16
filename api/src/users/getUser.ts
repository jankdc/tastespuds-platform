import * as Koa from 'koa'

import checkJwt from '../check-jwt'
import database from '../clients/database'
import * as auth0Users from '../clients/auth0-users'

async function getUser(ctx: Koa.Context) {
  const [ user ] = await auth0Users.getUsers(`nickname:${ctx.params.username}`)

  if (!user) {
    return ctx.throw(404, 'Username doesn\'t exist', {
      id: 'INVALID_USERNAME'
    })
  }

  const result = await database.queryViaFile(__dirname + '/getUserReviews.sql', [
    user.user_id
  ])

  ctx.body = {
    id: user.user_id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    reviews: result.rows,
    username: user.user_metadata.username
  }
}

export default [
  checkJwt,
  getUser
]
