import * as Koa from 'koa'

import checkJwt from '../check-jwt'
import database from '../clients/database'

async function unlikeReview(ctx: Koa.Context) {
  // Current working directory path
  const cwp = (filename: string) => `${__dirname}/${filename}`

  await database.createTransaction(async (client) => {
    const getLikeQuery = `
      SELECT * FROM tastespuds.like_review
      WHERE id = $1 AND review_id = $2
    `

    const getLikeResult = await database.queryClientViaText(client, getLikeQuery, [
      ctx.params.likeId,
      ctx.params.reviewId
    ])

    if (getLikeResult.rowCount === 0) {
      return ctx.throw(404, 'Could not find the liked review', {
        id: 'missing-review-like-id'
      })
    }

    const like = getLikeResult.rows[0]
    if (like.user_id !== ctx.state.user.sub) {
      return ctx.throw(403, 'Not allowed to unlike someone else\'s like', {
        id: 'forbidden-user-unlike'
      })
    }

    const unlikeResult = await database.queryClientViaFile(client, cwp('unlikeReview.sql'), [
      ctx.params.likeId
    ])

    if (unlikeResult.rowCount === 0) {
      return ctx.throw(500, 'Failed to unlike the review', {
        id: 'failed-review-unlike'
      })
    }

    ctx.status = 200
    ctx.body = like
  })
}

export default [
  checkJwt,
  unlikeReview
]
