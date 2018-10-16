import * as Koa from 'koa'

import * as gplaces from '../clients/google-places'
import database from '../clients/database'
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

  const googlePlaces = await gplaces.searchNearby(userLocation)
  const googlePlaceIds = googlePlaces.map(gp => gp.place_id)
  const googlePlaceRef = googlePlaces.reduce((obj, place) => {
    obj[place.place_id] = place
    delete obj.place_id
    return obj
  }, {} as any)

  // Cache new google place ids in the database
  await database.queryViaFile(__dirname + '/insertPlaces.sql', [
    googlePlaceIds
  ])

  const results = await database.queryViaFile(__dirname + '/searchPlaces-ids.sql', [
    googlePlaceIds
  ])

  // Interpolate google place data as part of the response
  const places = results.rows.map(place => {
    const googlePlace = googlePlaceRef[place.gplace_id]

    return {
      id: place.id,
      name: googlePlace.name,
      types: googlePlace.types,
      photos: googlePlace.photos,
      address: googlePlace.vicinity,
      gplaceId: place.gplace_id
    }
  })

  ctx.body = {
    places
  }
}

export default [
  createValidator(inputSchema),
  searchPlaces
]
