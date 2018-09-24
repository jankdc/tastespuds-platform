import * as env from 'env-var'
import * as got from 'got'

const AUTH0_CLIENT_ID = env.get('AUTH0_CLIENT_ID').required().asString()
const AUTH0_DOMAIN_URL = env.get('AUTH0_DOMAIN_URL').required().asUrlString()
const AUTH0_CLIENT_SECRET = env.get('AUTH0_CLIENT_SECRET').required().asString()

export interface SignInTokens {
  access_token: string
  refresh_token: string
  id_token: string
  token_type: string
  expires_in: number
}

export interface IdToken {
  name?: string
  email?: string
  picture?: string
  sub: string
  iss: string
  aud: string
  exp: string
  iat: string
}

export async function getTokens(code: string, redirectUri: string) {
  interface RequestBody {
    client_secret: string
    redirect_uri: string
    grant_type: string
    client_id: string
    code: string
  }

  const body: RequestBody = {
    client_secret: AUTH0_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    client_id: AUTH0_CLIENT_ID,
    code
  }

  const response = await got.post(`${AUTH0_DOMAIN_URL}/oauth/token`, {
    body,
    json: true
  })

  return response.body as SignInTokens
}
