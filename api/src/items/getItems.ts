import * as Koa from 'koa'
import checkJwt from '../check-jwt'
import database from '../clients/database'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    placeId: {
      type: 'string'
    }
  },
  required: ['placeId'],
  additionalProperties: false
}

async function getItems(ctx: Koa.Context) {
  const results = await database.queryViaFile(__dirname + '/getItems.sql', [
    parseInt(ctx.query.placeId, 10)
  ])

  ctx.status = 200
  ctx.body = results.rows
}

export default [
  checkJwt,
  createValidator(inputSchema),
  getItems
]
