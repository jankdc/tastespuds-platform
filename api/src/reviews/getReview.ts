import * as Koa from 'koa'

import database from '../clients/database'
import checkJwt from '../check-jwt'

async function getReview(ctx: Koa.Context) {
  const result = await database.queryViaFile(__dirname + '/getReview.sql', [
    parseInt(ctx.params.reviewId, 10)
  ])

  if (result.rowCount === 0) {
    return ctx.throw(404, 'Review does not exist', {
      id: 'INVALID_REVIEW_ID'
    })
  }

  const review = result.rows[0]

  const reviewLikesResults = await database.queryViaFile(
    __dirname + '/getReviewLikes.sql',
    [review.id, ctx.state.user.sub]
  )

  const reviewAssetsResults = await database.queryViaFile(
    __dirname + '/getReviewAssets.sql',
    [review.id]
  )

  // This prop provides contextual information for the one who called the API
  review.context = {
    caller_like_id: reviewLikesResults.rows[0] && reviewLikesResults.rows[0].id
  }

  review.assets = reviewAssetsResults.rows

  // By default, COUNT operations is returned as strings
  // https://github.com/brianc/node-postgres/pull/427
  review.num_of_likes = parseInt(review.num_of_likes, 10)

  ctx.body = review
}

export default [
  checkJwt,
  getReview
]
