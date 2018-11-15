import * as Koa from 'koa'

import checkJwt from '../check-jwt'
import database from '../clients/database'
import * as auth0Users from '../clients/auth0-users'

async function getMe(ctx: Koa.Context) {
  const [ user ] = await auth0Users.getUsers(`user_id:${ctx.state.user.sub}`)
  const result = await database.queryViaFile(__dirname + '/getMeReviews.sql', [
    user.user_id
  ])

  ctx.body = {
    id: user.user_id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    reviews: result.rows,
    username: user.nickname
  }
}

export default [
  checkJwt,
  getMe
]
