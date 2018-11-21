import * as Koa from 'koa'

import database from '../clients/database'
import checkJwt from '../check-jwt'
import * as auth0Users from '../clients/auth0-users'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    content: {
      type: 'string'
    },
    parent_id: {
      type: 'integer'
    }
  },
  additionalProperties: false,
  required: ['content']
}

async function addComment(ctx: Koa.Context) {
  const body = ctx.request.body as any

  // Current working directory path
  const cwp = (filename: string) => `${__dirname}/${filename}`

  const result = await database.queryViaFile(cwp('addComment.sql'), [
    parseInt(ctx.params.reviewId, 10),
    ctx.state.user.sub,
    body.content,
    body.parent_id || null
  ])

  const comment = result.rows[0]
  const [ user ] = await auth0Users.getUsersViaIds([comment.user_id])

  comment.user = {
    id: user.user_id,
    picture: user.picture,
    username: user.user_metadata.username
  }

  comment.num_of_likes = 0

  comment.context = {}

  delete comment.user_id

  ctx.body = comment
}

export default [
  checkJwt,
  createValidator(inputSchema),
  addComment
]
