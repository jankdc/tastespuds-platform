import * as Koa from 'koa'

import sqb from '../sql-builder'
import database from '../clients/database'
import checkJwt from '../check-jwt'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    location: {
      type: 'string'
    },
    keyword: {
      type: 'string'
    }
  },
  oneOf: [
    { required: ['location'] },
    { required: ['keyword'] }
  ],
  additionalProperties: false
}

async function searchPlaces(ctx: Koa.Context) {
  let parsedLocation

  if (ctx.query.location) {
    const parsedQs = ctx.query.location.split(',')
    parsedLocation = [
      parseFloat(parsedQs[0]),
      parseFloat(parsedQs[1])
    ]
  }

  const query = sqb.select()
    .from('tastespuds.place')
    .field('*')

  if (ctx.query.keyword) {
    query.where('search_tsv @@ plainto_tsquery(?)',
      ctx.query.keyword
    )
  }

  if (parsedLocation) {
    query.where('dist_diff_in_km(location, ?::float[]) < 1', [parsedLocation])
  }

  query.order('dist_diff_in_km(location, ?::float[])', true, [parsedLocation])
  query.limit(10)

  const { text, values } = query.toParam()
  const results = await database.queryViaText(text, values)

  ctx.body = results.rows
}

export default [
  checkJwt,
  createValidator(inputSchema),
  searchPlaces
]
