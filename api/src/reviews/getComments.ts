import * as Koa from 'koa'

import { encodeCursor, parseCursor } from '../cursor'
import { createValidator } from '../input'
import * as auth0Users from '../clients/auth0-users'
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

  const usersArr = await auth0Users.getUsersViaIds([
    ...new Set(comments.map((c) => c.user_id ))
  ])

  const usersRef = usersArr.reduce((ref: any, user) => {
    ref[user.user_id] = user
    return ref
  }, {})

  comments.forEach((comment) => {
    const user = usersRef[comment.user_id] as auth0Users.UserInfo

    // This prop provides contextual information for the one who called the API
    comment.context = {
      caller_like_id: comment.caller_like_id
    }

    comment.user = {
      id: user.user_id,
      picture: user.picture,
      username: user.user_metadata.username
    }

    // By default, COUNT operations is returned as strings
    // https://github.com/brianc/node-postgres/pull/427
    comment.num_of_likes = parseInt(comment.num_of_likes, 10)

    delete comment.user_id
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
