import * as Koa from 'koa'
import checkJwt from '../check-jwt'
import database from '../clients/database'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    place_id: {
      type: 'string'
    }
  },
  required: ['place_id'],
  additionalProperties: false
}

async function getItems(ctx: Koa.Context) {
  const results = await database.queryViaFile(__dirname + '/getItems.sql', [
    parseInt(ctx.query.place_id, 10)
  ])

  ctx.status = 200
  ctx.body = results.rows
}

export default [
  checkJwt,
  createValidator(inputSchema),
  getItems
]
