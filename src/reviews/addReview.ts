import * as Koa from 'koa'

import database from '../clients/database'
import checkJwt from '../check-jwt'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    assets: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    rating: {
      type: 'integer',
      minimum: 1,
      maximum: 5
    },
    content: {
      type: 'string'
    },
    user_id: {
      type: 'string'
    },
    highlight: {
      type: 'string'
    },
    suggestion: {
      type: 'string'
    },
    price: {
      type: 'number'
    },
    item: {
      oneOf: [
        { type: 'integer' },
        {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            place_id: {
              type: 'integer'
            }
          },
          additionalProperties: false,
          required: ['name', 'place_id']
        }
      ]
    }
  },
  additionalProperties: false,
  required: [
    'user_id',
    'highlight',
    'assets',
    'rating',
    'content',
    'price',
    'item'
  ]
}

async function addReview(ctx: Koa.Context) {
  const body = ctx.request.body as any

  // Current working directory path
  const cwp = (filename: string) => `${__dirname}/${filename}`

  await database.createTransaction(async (client) => {
    if (typeof body.item === 'object') {
      const { place_id, name } = body.item as any
      const addItemResults = await database.queryClientViaFile(client, cwp('addItem.sql'), [
        name,
        place_id
      ])

      body.item = addItemResults.rows[0].id
    }

    const addReviewResults = await database.queryClientViaFile(client, cwp('addReview.sql'), [
      body.user_id,
      body.content,
      body.rating,
      body.item,
      body.highlight,
      body.suggestion,
      body.price
    ])

    await Promise.all(body.assets.map((assetId: number) => {
      return database.queryClientViaFile(client, cwp('addReviewAsset.sql'), [
        addReviewResults.rows[0].id,
        assetId
      ])
    }))

    ctx.body = addReviewResults.rows[0]
  })
}

export default [
  checkJwt,
  createValidator(inputSchema),
  addReview
]
