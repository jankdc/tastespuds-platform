import * as Koa from 'koa'
import checkJwt from '../check-jwt'
import database from '../clients/database'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    placeId: {
      type: 'integer'
    }
  },
  required: ['placeId'],
  additionalProperties: false
}

async function getItems(ctx: Koa.Context) {
  const results = await database.queryViaFile(__dirname + '/getItems.sql', [
    ctx.query.placeId
  ])

  ctx.status = 200
  ctx.body = results.rows
}

export default [
  checkJwt,
  createValidator(inputSchema),
  getItems
]
