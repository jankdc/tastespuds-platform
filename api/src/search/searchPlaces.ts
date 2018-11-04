import * as Koa from 'koa'
import { PoolClient } from 'pg'

import database from '../clients/database'
import checkJwt from '../check-jwt'
import * as gplaces from '../clients/google-places'
import { createValidator } from '../input'

const inputSchema = {
  type: 'object',
  properties: {
    location: {
      type: 'string'
    }
  },
  required: ['location']
}

async function searchPlaces(ctx: Koa.Context) {
  const parsedQs = ctx.query.location.split(',')
  const userLocation = {
    lat: parseFloat(parsedQs[0]),
    lng: parseFloat(parsedQs[1])
  }

  await database.createTransaction(async (client) => {
    const googlePlaces = await gplaces.searchNearby(userLocation)

    ctx.body = await Promise.all(googlePlaces.map(async (place) => {
      const existingPlace = await searchGooglePlace(client, place)

      if (existingPlace) {
        return existingPlace
      }

      return insertGooglePlace(client, place)
    }))
  })
}

async function searchGooglePlace(client: PoolClient, place: gplaces.Place) {
  const dbArgs = [`google|${place.place_id}`]
  const filePath = __dirname + '/searchPlace.sql'
  const { rows } = await database.queryClientViaFile(client, filePath, dbArgs)

  return rows[0]
}

async function insertGooglePlace(client: PoolClient, place: gplaces.Place) {
  const { result: details } = await gplaces.getPlaceDetails(place.place_id, {
    fields: 'address_components'
  })

  const address = gplaces.parseAddress(details.address_components)

  const filePath = __dirname + '/insertPlace.sql'
  const { rows } = await database.queryClientViaFile(client, filePath, [
    place.name,
    place.types,
    [place.geometry.location.lat, place.geometry.location.lng],
    address.street,
    address.city,
    address.country,
    address.postal_code,
    `google|${place.place_id}`
  ])

  return rows[0]
}

export default [
  checkJwt,
  createValidator(inputSchema),
  searchPlaces
]
