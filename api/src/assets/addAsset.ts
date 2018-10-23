import * as Koa from 'koa'
import * as uuidv4 from 'uuid/v4'

import checkJwt from '../check-jwt'
import database from '../clients/database'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    width: {
      type: 'string'
    },
    height: {
      type: 'string'
    }
  },
  additionalProperties: false
}

async function addAsset(ctx: Koa.Context) {
  // koa-multer issue https://github.com/koa-modules/multer/issues/14
  const req = ctx.req as any
  const file = req.file
  const body = req.body

  const name = uuidv4()

  const results = await database.queryViaFile(__dirname + '/addAsset.sql', [
    name,
    file.mimetype,
    file.buffer,
    file.originalname,
    body
  ])

  const asset = results.rows[0]

  ctx.body = {
    id: asset.id,
    type: asset.type,
    options: asset.options,
    originalName: asset.original_name,
    creationDate: asset.creation_date
  }

  ctx.status = 200
}

export default [
  checkJwt,
  createValidator(inputSchema),
  addAsset
]
