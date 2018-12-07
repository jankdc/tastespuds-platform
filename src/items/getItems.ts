import * as Koa from 'koa'

import sqb from '../sql-builder'
import checkJwt from '../check-jwt'
import database from '../clients/database'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    place_id: {
      type: 'string'
    },
    location: {
      type: 'string'
    },
    keyword: {
      type: 'string'
    },
    city: {
      type: 'string'
    },
    sort: {
      type: 'string',
      enum: ['top', 'popular', 'recent']
    },
  },
  oneOf: [
    { required: ['place_id'] },
    { required: ['location'] },
    { required: ['city'] }
  ],
  additionalProperties: false
}

async function getItems(ctx: Koa.Context) {
  let parsedLocation

  if (ctx.query.location) {
    const [latStr, lngStr] = ctx.query.location.split(',')
    parsedLocation = [
      parseFloat(latStr),
      parseFloat(lngStr)
    ]
  }

  const mainSql = sqb.select()
    .from('tastespuds.review', 'r')
    .field('r.*')
    .field('COUNT(lr.*)', 'likes')
    .field('json_agg(ra.*)->0->\'asset_id\'', 'asset')
    .join('tastespuds.review_asset', 'ra', 'r.id = ra.review_id')
    .left_join('tastespuds.like_review', 'lr', 'r.id = lr.review_id')
    .where('r.item_id = i.id')
    .group('r.id')
    .order('likes', false)
    .limit(1)

  const assetSql = sqb.select()
    .from('popular_review')
    .field('asset')
    .with('popular_review', mainSql)

  // TODO: This is just lazy. Need to find another to remove this redundancy
  const highlightSql = sqb.select()
    .from('popular_review')
    .field('highlight')
    .with('popular_review', mainSql)

  const baseSql = sqb.select()
    .from('tastespuds.item', 'i')
    .field('i.id')
    .field('i.name')
    .field('i.creation_date')
    .field(assetSql, 'asset')
    .field(highlightSql, 'highlight')
    .field('COUNT(r.*)', 'reviews')
    .field('COUNT(lr.*)', 'likes')
    .field('AVG(r.rating)', 'rating')
    .field('json_agg(p.*)->0', 'place')
    .field('COUNT(r.*) + COUNT(lr.*)', 'popularity')
    .field('MAX(r.creation_date)', 'recent_review_date')
    .join('tastespuds.place', 'p', 'i.place_id = p.id')
    .join('tastespuds.review', 'r', 'i.id = r.item_id')
    .left_join('tastespuds.like_review', 'lr', 'r.id = lr.review_id')

  if (ctx.query.keyword) {
    baseSql.where('i.name % ? OR i.search_tsv @@ plainto_tsquery(?)',
      ctx.query.keyword,
      ctx.query.keyword
    )
  }

  if (ctx.query.place_id) {
    baseSql.where('p.id = ?', parseInt(ctx.query.place_id, 10))
  }

  if (ctx.query.city) {
    baseSql.where('p.city = ?', ctx.query.city)
  }

  if (parsedLocation) {
    baseSql.where('dist_diff_in_km(p.location, ?::float[]) < 5', [parsedLocation])
  }

  baseSql.group('i.id')

  switch (ctx.query.sort) {
    case 'top':
      baseSql.order('rating', false)
      break
    case 'popular':
      baseSql.order('popularity', false)
      break
    case 'recent':
      baseSql.order('recent_review_date', false)
      break
  }

  baseSql.limit(100)

  const { text, values } = baseSql.toParam()

  const results = await database.queryViaText(text, values)

  ctx.status = 200
  ctx.body = results.rows
}

export default [
  checkJwt,
  createValidator(inputSchema),
  getItems
]
