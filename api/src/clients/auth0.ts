import * as config from '../config'
import * as got from 'got'

export interface AuthenticationTokens {
  refresh_token: string
  access_token: string
  token_type: string
  expires_in: number
  id_token: string
}

export async function authenticateUserFromOauth(code: string) {
  const url = `${config.auth0DomainUrl}/oauth/token`
  const res = await got.post(url, {
    json: true,
    body: {
      grant_type: 'authorization_code',
      client_id: config.auth0ClientId,
      client_secret: config.auth0ClientSecret,
      code
    }
  })

  return res.body as AuthenticationTokens
}
