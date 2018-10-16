import * as qs from 'querystring'
import * as got from 'got'
import * as config from '../config'

const API_KEY = config.googlePlacesApiKey
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

export interface SearchNearbyResponse {
  status: string
  results: Place[]
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
    got(createUrl('bakery'), { json: true }),
    got(createUrl('cafe'), { json: true }),
    got(createUrl('bar'), { json: true })
  ])

  // Let's just ignore the place API errors as we don't really need to know why it failed
  // TODO: Log the error server-side for monitoring purposes
  return responses
    .map((r) => r.body as SearchNearbyResponse)
    .map((r) => r.results)
    .reduce((acc, arr) => acc.concat(arr), [])
}

export interface SearcyByKeywordOptions {
  radius?: number
  location?: string
}

export interface SearchByKeywordResponse {
  status: string
  results: Place[]
}

export async function searchByKeyword(keyword: string, options?: SearcyByKeywordOptions) {
  const queries: any = {
    key: API_KEY,
    query: keyword
  }

  if (options) {
    Object.assign(queries, options)
  }

  const searchUrl = BASE_URL + '/textsearch/json?' + qs.stringify(queries)

  const response = await got(searchUrl, { json: true })

  return response.body as SearchByKeywordResponse
}
