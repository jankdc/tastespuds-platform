import * as qs from 'querystring'
import * as got from 'got'
import * as config from '../config'

const API_KEY = config.googlePlacesApiKey
const BASE_URL = 'https://maps.googleapis.com/maps/api/place'

export interface Place {
  name: string
  types: string[]
  place_id: string
  geometry: {
    location: Location
  }
}

export interface PlaceDetails {
  address_components: AddressComponent[]
}

export interface Location {
  lat: number,
  lng: number
}

export interface Address {
  street: string
  city: string
  country: string
  postal_code: string
}

export interface AddressComponent {
  types: string[]
  long_name: string
  short_name: string
}

export function parseAddress(components: AddressComponent[]): Address {
  const address: Address = {
    street: '',
    city: '',
    country: '',
    postal_code: ''
  }

  components.forEach((c) => {
    switch (c.types[0]) {
      case 'street_address':
          address.street = c.long_name
          break
      case 'street_number':
          address.street = c.long_name
          break
      case 'route':
          address.street = `${address.street} ${c.long_name}`
          break
      case 'neighborhood': case 'locality':
          address.city = c.short_name
          break
      case 'postal_code':
          address.postal_code = c.long_name
          break
      case 'country':
          address.country = c.long_name
          break
      }
  })

  address.street = address.street.trim()

  return address
}

export interface SearchNearbyResponse {
  status: string
  results: Place[]
}

export async function searchNearby(location: Location) {
  const createUrl = (type: string) => BASE_URL + '/nearbysearch/json?' + qs.stringify({
    location: `${location.lat},${location.lng}`,
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

export interface GetPlaceDetailsOptions {
  fields?: string
}

export interface GetPlaceDetailsResponse {
  status: string
  result: PlaceDetails
}

export async function getPlaceDetails(id: string, options?: GetPlaceDetailsOptions) {
  const queries: any = {
    key: API_KEY,
    placeid: id
  }

  if (options) {
    Object.assign(queries, options)
  }

  const searchUrl = BASE_URL + '/details/json?' + qs.stringify(queries)

  const response = await got(searchUrl, { json: true })

  return response.body as GetPlaceDetailsResponse
}
