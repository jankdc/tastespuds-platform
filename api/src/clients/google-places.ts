import * as env from 'env-var'
import * as got from 'got'
import * as qs from 'querystring'

const API_KEY = env.get('GOOGLE_PLACES_API_KEY').required().asString()
const BASE_URL = 'https://maps.googleapis.com/maps/api/place'

export interface Place {
  name: string
  place_id: string
  geometry: {
    location: Location
  }
}

export interface Location {
  lat: number,
  lng: number
}

export interface NearbyResponse {
  status?: number
  results?: Place[]
}

export async function searchNearby(location: Location) {
  const createUrl = (type: string) => BASE_URL + '/nearbysearch/json?' + qs.stringify({
    location: [location.lat, location.lng],
    rankby: 'distance',
    type,
    key: API_KEY
  })

  const responses = await Promise.all([
    got(createUrl('restaurant'), { json: true }),
    // TODO: Only uncomment this when we're on production because this shit is expensive
    // got.get(createUrl('cafe')),
    // got.get(createUrl('bar')),
  ])

  // Let's just ignore the place API errors as we don't really need to know why it failed
  // TODO: Log the error server-side for monitoring purposes
  return responses
    .map((r) => r.body as NearbyResponse)
    .map((r) => r.results as Place[])
    .reduce((acc, arr) => acc.concat(arr))
}
