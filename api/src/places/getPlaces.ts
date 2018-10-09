import * as Koa from 'koa'
import * as googlePlaces from '../clients/google-places'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    }
  },
  required: ['name'],
  additionalProperties: false
}

async function getPlaces(ctx: Koa.Context) {
  if (ctx.query.name) {
    const result = await googlePlaces.searchByKeyword(ctx.query.name)

    ctx.body = {
      places: result.candidates
    }
  }
}

export default [
  createValidator(inputSchema),
  getPlaces
]
