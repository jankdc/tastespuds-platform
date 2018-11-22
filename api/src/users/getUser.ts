import * as Koa from 'koa'

import checkJwt from '../check-jwt'
import database from '../clients/database'

async function getUser(ctx: Koa.Context) {
  const userResult = await database.queryViaFile(__dirname + '/getUser.sql', [
    ctx.state.user.sub
  ])

  const user = userResult.rows[0]

  const reviewsResult = await database.queryViaFile(__dirname + '/getUserReviews.sql', [
    user.user_id
  ])

  const reviews = reviewsResult.rows

  ctx.body = {
    id: user.id,
    email: user.email,
    picture: user.picture,
    reviews,
    username: user.user_metadata.username
  }
}

export default [
  checkJwt,
  getUser
]
