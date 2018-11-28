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
  const reduceByTypes = (acc: any, item: AddressComponent): any => {
    item.types.forEach((type) => {
      const { short_name, long_name } = item
      acc[type] = { long_name, short_name }
    })

    return acc
  }

  const addressByType = components.reduce(reduceByTypes, {})

  const getComponent = (key: string, short?: boolean) => {
    if (!addressByType[key]) {
      return ''
    }

    return short ? addressByType[key].short_name : addressByType[key].long_name
  }

  return {
    city: getComponent('locality', true)
      || getComponent('postal_town', true)
      || getComponent('administrative_area_level_1', true)
      || getComponent('administrative_area_level_2', true)
      || getComponent('administrative_area_level_3', true)
      || getComponent('administrative_area_level_4', true)
      || getComponent('administrative_area_level_5', true),

    street: getComponent('street_address')
      || `${getComponent('subpremise')} ${getComponent('premise')}`.trim()
      || `${getComponent('street_number')} ${getComponent('route')}`.trim(),

    country: getComponent('country'),

    postal_code: getComponent('postal_code')
  }
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

  const reduceIds = (acc: any, place: Place) => {
    return Object.assign({}, acc, {
      [place.place_id]: place
    })
  }

  // Let's just ignore the place API errors as we don't really need to know why it failed
  // TODO: Log the error server-side for monitoring purposes
  return responses
    .map((r) => r.body as SearchNearbyResponse)
    .map((r) => r.results)
    .reduce((master, places) => {
      // Reason we're doing this instead of just concatenating the arrays together
      // is because some places with the same place_id can occur in different place types
      // e.g. (restaurant, bars)
      const masterMap = master.reduce(reduceIds, {})
      const placesMap = places.reduce(reduceIds, {})
      const mergedMap = Object.assign({}, masterMap, placesMap)

      return Object.values(mergedMap)
    }, [])
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
