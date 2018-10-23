import * as Koa from 'koa'

import checkJwt from '../check-jwt'
import * as gplaces from '../clients/google-places'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    location: {
      type: 'string'
    }
  },
  required: ['name', 'location'],
  additionalProperties: false
}

async function getPlaces(ctx: Koa.Context) {
  const { results } = await gplaces.searchByKeyword(ctx.query.name, {
    radius: 1000,
    location: ctx.query.location
  })

  ctx.body = results
}

export default [
  checkJwt,
  createValidator(inputSchema),
  getPlaces
]
