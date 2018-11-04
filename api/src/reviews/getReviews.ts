import * as Koa from 'koa'

import * as auth0Users from '../clients/auth0-users'
import * as math from '../math'
import database from '../clients/database'
import checkJwt from '../check-jwt'
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

interface UserLocation {
  lat: number
  lng: number
}

async function getReviews(ctx: Koa.Context) {
  const parsedQs = ctx.query.location.split(',')
  const results = await database.queryViaFile(__dirname + '/getReviews.sql')
  const reviews = results.rows

  if (results.rowCount === 0) {
    ctx.status = 200
    ctx.body = []
    return
  }

  const userLocation: UserLocation = {
    lat: parseFloat(parsedQs[0]),
    lng: parseFloat(parsedQs[1])
  }

  const furthestKm = furthestDistanceInKm(reviews, userLocation)
  const hotScoreFn = (review: any): number => {
    const [lat, lng] = review.place.location

    const distance = math.diffInKm(
      userLocation.lat,
      userLocation.lng,
      lat,
      lng
    )

    const distanceWeightedScore = 1 - (distance / furthestKm)

    return distanceWeightedScore
      + (2 * review.date_weighted_score)
      + (3 * review.likes_weighted_score)
  }

  reviews.sort((reviewA, reviewB) => hotScoreFn(reviewB) - hotScoreFn(reviewA))

  const allUsers = await auth0Users.getUsersViaIds(reviews.map((r) => r.user_id))
  const mapsById = (name: string) => (acc: any, item: any) => {
    const copy = Object.assign({}, item)
    acc[copy[name]] = copy
    delete copy[name]
    return acc
  }

  const a0usersRef = allUsers.reduce(mapsById('user_id'), {})

  // Replace references in review object
  await Promise.all(reviews.map(async (review) => {
    const a0user = a0usersRef[review.user_id]

    const reviewLikesResults = await database.queryViaFile(
      __dirname + '/getReviewLikes.sql',
      [review.id, ctx.state.user.sub]
    )

    const reviewAssetsResults = await database.queryViaFile(
      __dirname + '/getReviewAssets.sql',
      [review.id]
    )

    // This prop provides contextual information for the one who called the API
    review.context = {
      caller_like_id: reviewLikesResults.rows[0] && reviewLikesResults.rows[0].id
    }

    review.assets = reviewAssetsResults.rows

    review.user = {
      id: a0user.user_id,
      picture: a0user.picture,
      username: a0user.user_metadata.username
    }

    // By default, COUNT operations is returned as strings
    // https://github.com/brianc/node-postgres/pull/427
    review.num_of_likes = parseInt(review.num_of_likes, 10)

    delete review.user_id
  }))

  ctx.body = reviews
}

function furthestDistanceInKm(reviews: any[], location: UserLocation): number {
  const distances = reviews.map((review) => {
    return math.diffInKm(
      location.lat,
      location.lng,
      review.place.location[0],
      review.place.location[1]
    )
  })

  return Math.max(...distances)
}

export default [
  checkJwt,
  createValidator(inputSchema),
  getReviews
]
