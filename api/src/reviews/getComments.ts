import * as Koa from 'koa'

import { encodeCursor, parseCursor } from '../cursor'
import { createValidator } from '../input'
import database from '../clients/database'
import checkJwt from '../check-jwt'

const inputSchema = {
  type: 'object',
  properties: {
    next_cursor: {
      type: 'string'
    }
  }
}

async function getComments(ctx: Koa.Context) {
  const cursor = processCursor(ctx.query.next_cursor)
  const result = await database.queryViaFile(__dirname + '/getComments.sql', [
    parseInt(ctx.params.reviewId, 10),
    ctx.state.user.sub,
    cursor
  ])

  const comments = result.rows

  if (comments.length === 0) {
    return ctx.body = {
      comments
    }
  }

  comments.forEach((comment) => {
    // This prop provides contextual information for the one who called the API
    comment.context = {
      caller_like_id: comment.caller_like_id
    }

    // By default, COUNT operations is returned as strings
    // https://github.com/brianc/node-postgres/pull/427
    comment.num_of_likes = parseInt(comment.num_of_likes, 10)

    delete comment.caller_like_id
  })

  const lastComment = comments[comments.length - 1]

  ctx.body = {
    comments,
    response_metadata: {
      next_cursor: encodeCursor([{
        key: 'date',
        value: lastComment.creation_date
      }])
    }
  }
}

function processCursor(queryParam?: string): Date {
  if (!queryParam) {
    return new Date()
  }

  const cursor = parseCursor(queryParam)
  return new Date(cursor.date)
}

export default [
  checkJwt,
  createValidator(inputSchema),
  getComments
]
