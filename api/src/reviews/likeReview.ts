import * as Koa from 'koa'

import checkJwt from '../check-jwt'
import database from '../clients/database'

async function likeReview(ctx: Koa.Context) {
  // Current working directory path
  const cwp = (filename: string) => `${__dirname}/${filename}`

  const { rows } = await database.queryViaFile(cwp('likeReview.sql'), [
    ctx.state.user.sub,
    ctx.params.reviewId
  ])

  ctx.body = rows[0]
  ctx.status = 200
}

export default [
  checkJwt,
  likeReview
]
