import * as Koa from 'koa'

import database from '../clients/database'

async function getAsset(ctx: Koa.Context) {
  const results = await database.queryViaFile(__dirname + '/getAsset.sql', [
    ctx.params.assetId
  ])

  const { type, data } = results.rows[0]

  ctx.status = 200
  ctx.type = type
  ctx.body = data
}

export default [
  getAsset
]
