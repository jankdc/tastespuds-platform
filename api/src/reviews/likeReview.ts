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

  const like = rows[0]

  ctx.body = {
    id: like.id,
    userId: like.user_id,
    reviewId: like.review_id,
    creationDate: like.creation_date
  }

  ctx.status = 200
}

export default [
  checkJwt,
  likeReview
]
