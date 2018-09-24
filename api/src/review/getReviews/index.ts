import * as Koa from 'koa'
import * as gplaces from '../../clients/google-places'
import * as math from '../../math'
import database from '../../clients/database'

export default async function getReviews(ctx: Koa.Context) {
  interface ReviewQueries {
    location?: string
  }

  const queries: ReviewQueries = ctx.query

  if (typeof queries.location !== 'string') {
    return ctx.throw('`location` parameter is missing in query', 422)
  }

  const parsedQs = queries.location.split(':')
  const results = await database.queryViaFile(__dirname + '/query.sql')
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

  ctx.body = {
    reviews: hotReviews
  }
}
