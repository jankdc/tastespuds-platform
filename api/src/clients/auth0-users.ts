import * as got from 'got'
import * as qs from 'querystring'

import * as config from '../config'

let cachedTime: any = null
let cachedAccess: any = null

export interface UserInfo {
  email: string
  email_verified: boolean
  name: string
  picture: string
  user_id: string
  updated_at: string
}

export interface ApiAccess {
  access_token: string
  expires_in: number
  token_type: string
  scope: string
}

export async function getAccess() {
  const currentTime = Date.now() / 1000
  if (cachedAccess && cachedAccess.expires_in + cachedTime < currentTime) {
    return cachedAccess
  }

  const response = await got.post(`${config.auth0DomainUrl}/oauth/token`, {
    json: true,
    body: {
      client_secret: config.auth0UsersClientSecret,
      grant_type: 'client_credentials',
      client_id: config.auth0UsersClientId,
      audience: `${config.auth0DomainUrl}/api/v2/`
    }
  })

  cachedTime = Date.now() / 1000
  cachedAccess = response.body

  return cachedAccess as ApiAccess
}

export async function updateUser(id: string, body: any) {
  const { access_token } = await getAccess()

  await got.patch(`${config.auth0DomainUrl}/api/v2/users/${id}`, {
    json: true,
    body,
    headers: {
     authorization: `Bearer ${access_token}`
    }
  })
}

export async function getUsers(q: string) {
  const { access_token } = await getAccess()

  const query = qs.stringify({
    search_engine: 'v3',
    per_page: 100,
    q
  })

  const response = await got(`${config.auth0DomainUrl}/api/v2/users?${query}`, {
    json: true,
    headers: {
     authorization: `Bearer ${access_token}`
    }
  })

  return response.body as UserInfo[]
}

export async function getUsersViaIds(userIds: string[]) {
  if (userIds.length > 100) {
    throw new Error('Exceeded max amount of users')
  }

  const q = userIds.map((userId) => `user_id:${userId}`).join(' OR ')
  return getUsers(q)
}
