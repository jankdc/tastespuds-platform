import * as Koa from 'koa'

import checkJwt from '../check-jwt'
import database from '../clients/database'
import streamjs from '../clients/stream-js'

async function likeReview(ctx: Koa.Context) {
  // Current working directory path
  const cwp = (filename: string) => `${__dirname}/${filename}`

  await database.createTransaction(async (client) => {
    const getUserQuery = 'SELECT * FROM tastespuds.user WHERE id $1'
    const { rows: [ user ] } = await database.queryClientViaText(client, getUserQuery, [
      ctx.state.user.sub
    ])

    await database.queryClientViaFile(client, cwp('likeReview.sql'), [
      ctx.state.user.sub,
      ctx.params.reviewId
    ])

    const getLikeQuery = `
      SELECT
        lr.*,
        r.user_id AS reviewer_id
      FROM
        tastespuds.like_review lr
      INNER JOIN
        tastespuds.review r ON r.id = lr.review_id
      WHERE
        lr.user_id = $1 AND lr.review_id = $2
    `

    const { rows: [ like ] } = await database.queryClientViaText(client, getLikeQuery, [
      ctx.state.user.sub,
      ctx.params.reviewId
    ])

    ctx.status = 200
    ctx.body = like

    const notificationFeed = streamjs.feed('notification', like.reviewer_id)
    notificationFeed.addActivity({
      time: like.creation_date,
      verb: 'like',
      actor: user.username,
      object: 'Review'
    })
  })
}

export default [
  checkJwt,
  likeReview
]
