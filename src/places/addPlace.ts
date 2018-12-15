import * as Koa from 'koa'

import sqb from '../sql-builder'
import checkJwt from '../check-jwt'
import database from '../clients/database'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    },
    location: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: {
        type: 'number'
      }
    },
    types: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
        minLength: 1
      }
    },
    street: {
      type: 'string',
      minLength: 1
    },
    city: {
      type: 'string',
      minLength: 1
    },
    country: {
      type: 'string',
      minLength: 1
    },
    postal_code: {
      type: 'string',
      minLength: 1
    },
    address_id: {
      type: 'string',
      minLength: 1
    }
  },
  required: [
    'name',
    'location',
    'types',
    'city',
    'street',
    'country',
    'postal_code',
    'address_id'
  ],
  additionalProperties: false
}

async function addPlace(ctx: Koa.Context) {
  const body = ctx.request.body as any

  const query = sqb.insert()
    .into('tastespuds.place')
    .set('name', body.name)
    .set('location', [body.location])
    .set('types', [body.types])
    .set('city', body.city)
    .set('street', body.street)
    .set('country', body.country)
    .set('postal_code', body.postal_code)
    .set('address_id', body.address_id)
    .returning('*')

  const { text, values } = query.toParam()
  const { rows: [ place ] } = await database.queryViaText(text, values)

  ctx.body = place
}

export default [
  checkJwt,
  createValidator(inputSchema),
  addPlace
]
