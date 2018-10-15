import * as Koa from 'koa'
import database from '../clients/database'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    gplaceId: {
      type: 'string'
    }
  },
  required: ['gplaceId'],
  additionalProperties: false
}

async function getItems(ctx: Koa.Context) {
  const results = await database.queryViaFile(__dirname + '/getItems.sql', [
    ctx.query.gplaceId
  ])

  ctx.status = 200
  ctx.body = {
    items: results.rows
  }
}

export default [
  createValidator(inputSchema),
  getItems
]
