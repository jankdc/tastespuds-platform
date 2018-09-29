import * as config from '../config'
import * as got from 'got'

export interface AuthenticationTokens {
  refresh_token: string
  access_token: string
  token_type: string
  expires_in: number
  id_token: string
}

export async function authenticateUserFromEmail(email: string, code: string) {
  const url = `${config.auth0DomainUrl}/oauth/ro`
  const res = await got.post(url, {
    json: true,
    body: {
      connection: 'email',
      grant_type: 'password',
      client_id: config.auth0ClientId,
      username: email,
      password: code,
      scope: 'openid offline_access'
    }
  })

  return res.body as AuthenticationTokens
}

export async function authenticateUserFromSms(phone: string, code: string) {
  const url = `${config.auth0DomainUrl}/oauth/ro`
  const res = await got.post(url, {
    json: true,
    body: {
      connection: 'sms',
      grant_type: 'password',
      client_id: config.auth0ClientId,
      username: phone,
      password: code,
      scope: 'openid offline_access'
    }
  })

  return res.body as AuthenticationTokens
}
