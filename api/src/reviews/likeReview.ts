import * as Koa from 'koa'

import checkJwt from '../check-jwt'
import database from '../clients/database'

async function likeReview(ctx: Koa.Context) {
  // Current working directory path
  const cwp = (filename: string) => `${__dirname}/${filename}`

  await database.createTransaction(async (client) => {
    await database.queryClientViaFile(client, cwp('likeReview.sql'), [
      ctx.state.user.sub,
      ctx.params.reviewId
    ])

    const getLikeQuery = `
      SELECT * FROM tastespuds.like_review
      WHERE user_id = $1 AND review_id = $2
    `

    const { rows } = await database.queryClientViaText(client, getLikeQuery, [
      ctx.state.user.sub,
      ctx.params.reviewId
    ])

    ctx.status = 200
    ctx.body = rows[0]
  })
}

export default [
  checkJwt,
  likeReview
]
