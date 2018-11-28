import * as Koa from 'koa'

import checkJwt from '../check-jwt'
import database from '../clients/database'

async function getMe(ctx: Koa.Context) {
  const userResult = await database.queryViaFile(__dirname + '/getMe.sql', [
    ctx.state.user.sub
  ])

  const user = userResult.rows[0]

  const reviewsResult = await database.queryViaFile(__dirname + '/getMeReviews.sql', [
    ctx.state.user.sub
  ])

  const reviews = reviewsResult.rows

  ctx.body = {
    id: user.id,
    email: user.email,
    picture: user.picture,
    reviews,
    username: user.username
  }
}

export default [
  checkJwt,
  getMe
]
