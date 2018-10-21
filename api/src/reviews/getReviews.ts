import * as Koa from 'koa'

import * as auth0Users from '../clients/auth0-users'
import * as gplaces from '../clients/google-places'
import * as math from '../math'
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

async function getReviews(ctx: Koa.Context) {
  const parsedQs = ctx.query.location.split(',')
  const results = await database.queryViaFile(__dirname + '/getReviews.sql')

  if (results.rowCount === 0) {
    ctx.status = 200
    ctx.body = { reviews: [] }
    return
  }

  const userLocation = {
    lat: parseFloat(parsedQs[0]),
    lng: parseFloat(parsedQs[1])
  }

  const allPlaces = await gplaces.searchNearby(userLocation)
  const gplaceIds = allPlaces.map((p) => p.place_id)
  const findPlace = (id: string) => allPlaces.find((place) => place.place_id === id)

  // Hot means the past 7 days and it is relatively near the user location
  const hotReviews = results.rows.filter((r) => gplaceIds.includes(r.place.gplace_id))

  const hotScoreFn = (review: any): number => {
    const place = findPlace(review.place.gplace_id) as gplaces.Place

    const location = place.geometry.location
    const distance = math.diffInKm(
      userLocation.lat,
      userLocation.lng,
      location.lat,
      location.lng
    )

    return distance * review.date_weighted_score * review.likes_weighted_score
  }

  hotReviews.sort((reviewA, reviewB) => hotScoreFn(reviewB) - hotScoreFn(reviewA))

  const allUsers = await auth0Users.getUsersViaIds(hotReviews.map((r) => r.user_id))
  const mapsById = (name: string) => (acc: any, item: any) => {
    const copy = Object.assign({}, item)
    acc[copy[name]] = copy
    delete copy[name]
    return acc
  }

  const a0usersRef = allUsers.reduce(mapsById('user_id'), {})
  const gplacesRef = allPlaces.reduce(mapsById('place_id'), {})

  // Replace references in review object
  await Promise.all(hotReviews.map(async (review) => {
    const a0user = a0usersRef[review.user_id]
    const gplace = gplacesRef[review.place.gplace_id]

    review.place = {
      id: review.place.id,
      name: gplace.name,
      types: gplace.types,
      photos: gplace.photos,
      address: gplace.vicinity,
      gplaceId: review.place.gplace_id
    }

    review.user = {
      id: a0user.user_id,
      picture: a0user.picture,
      username: a0user.user_metadata.username
    }

    const reviewAssetsResults = await database.queryViaFile(
      __dirname + '/getReviewAssets.sql',
      [review.id]
    )

    review.assets = reviewAssetsResults.rows.map((ra) => {
      return {
        id: ra.id,
        type: ra.type,
        options: ra.options
      }
    })

    delete review.user_id
  }))

  ctx.body = {
    reviews: hotReviews
  }
}

export default [
  createValidator(inputSchema),
  getReviews
]
