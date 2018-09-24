import * as Koa from 'koa'
import * as jwtDecode from 'jwt-decode'
import * as gplaces from './gplaces'
import * as auth0 from './auth0'
import * as math from './math'
import database from './database'

export async function createUser(ctx: Koa.Context) {
  interface RequestBody {
    code?: string
    redirectUri?: string
  }

  const { code, redirectUri } = ctx.request.body as RequestBody

  if (typeof code !== 'string') {
    return ctx.throw(422, 'Missing `code` in request body')
  }

  if (typeof redirectUri !== 'string') {
    return ctx.throw(422, 'Missing `redirectUri` in request body')
  }

  const tokens = await auth0.getTokens(code, redirectUri)
  const idToken: auth0.IdToken = jwtDecode(tokens.id_token)
  const queryStr = `
    INSERT INTO
      tastespuds.user (id)
    VALUES
      ($1)
    ON CONFLICT (id)
      DO UPDATE SET id = EXCLUDED.id
    RETURNING *;
  `

  const results = await database.query(queryStr, [idToken.sub])
  const newUser = results.rows[0]

  ctx.body = {
    user: newUser,
    tokens: {
      idToken: tokens.id_token,
      expiresIn: tokens.expires_in,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    }
  }
}

export async function findHottestReviews(ctx: Koa.Context) {
  interface ReviewQueries {
    location?: string
  }

  const queries: ReviewQueries = ctx.query

  if (typeof queries.location !== 'string') {
    return ctx.throw('`location` parameter is missing in query', 422)
  }

  const parsedQs = queries.location.split(':')
  const queryStr = `
    SELECT
      r.id,
      r.assets,
      r.user_id,
      r.rating,
      r.content,
      r.creation_date,

      json_agg(i.*)->0 AS item,
      json_agg(p.*)->0 AS place,

      COUNT(l.*) AS num_of_likes,

      exp(-4 * (date_part('day', now() - r.creation_date) / 7) ^ 2)
        AS date_weighted_score,

      SUM(COALESCE(exp(-4 * (date_part('day', now() - l.creation_date) / 7) ^ 2), 0))
        AS likes_weighted_score
    FROM
      tastespuds.review r
    INNER JOIN
      tastespuds.item i ON r.item_id = i.id
    INNER JOIN
      tastespuds.place p ON i.place_id = p.id
    LEFT JOIN
      tastespuds.like_review l ON r.id = l.review_id
    WHERE
      r.creation_date > now() - INTERVAL '7 days'
    GROUP BY
      r.id
  `

  const results = await database.query(queryStr)
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
