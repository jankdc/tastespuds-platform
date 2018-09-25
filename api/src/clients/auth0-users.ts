import * as env from 'env-var'
import * as got from 'got'
import * as qs from 'querystring'

const AUTH0_DOMAIN_URL = env.get('AUTH0_DOMAIN_URL').required().asUrlString()
const AUTH0_USERS_CLIENT_ID = env.get('AUTH0_USERS_CLIENT_ID').required().asString()
const AUTH0_USERS_CLIENT_SECRET = env.get('AUTH0_USERS_CLIENT_SECRET').required().asString()

let cachedTime: any = null
let cachedAccess: any = null

export interface GetAccessResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

export async function getAccess(): Promise<GetAccessResponse> {
  const currentTime = Date.now() / 1000
  if (cachedAccess && cachedAccess.expires_in + cachedTime < currentTime) {
    return cachedAccess
  }

  const body = {
    client_secret: AUTH0_USERS_CLIENT_SECRET,
    grant_type: 'client_credentials',
    client_id: AUTH0_USERS_CLIENT_ID,
    audience: `${AUTH0_DOMAIN_URL}/api/v2/`
  }

  const response = await got.post(`${AUTH0_DOMAIN_URL}/oauth/token`, {
    body,
    json: true
  })

  cachedTime = Date.now() / 1000
  cachedAccess = response.body

  return cachedAccess
}

export interface UserInfo {
  email: string
  email_verified: boolean
  name: string
  picture: string
  user_id: string
  nickname: string
  updated_at: string
}

export async function getUsersViaIds(userIds: string[]): Promise<UserInfo[]> {
  if (userIds.length > 100) {
    throw new Error('Exceeded max amount of users')
  }

  const { access_token } = await getAccess()

  const query = qs.stringify({
    include_fields: false,
    search_engine: 'v3',
    per_page: userIds.length,
    fields: ['logins_count', 'last_login', 'last_ip', 'identities', 'created_at'],
    q: userIds.map((userId) => `user_id:${userId}`).join(' OR ')
  })

  const response = await got(`${AUTH0_DOMAIN_URL}/api/v2/users?${query}`, {
    json: true,
    headers: {
     authorization: `Bearer ${access_token}`
    }
  })

  return response.body
}
