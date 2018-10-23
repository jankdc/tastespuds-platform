import * as Koa from 'koa'
import * as jwt from 'koa-jwt'
import * as rsa from 'jwks-rsa'

import * as config from './config'

export function createCheckJwtMiddleware(): Koa.Middleware {
  const secretLoader = rsa.koaJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 2,
    jwksUri: `${config.jwksHost}/.well-known/jwks.json`
  })

  return jwt({
    // NOTE: Forced type coercion because of bad typing
    // https://github.com/auth0/node-jwks-rsa/issues/46
    secret: secretLoader as jwt.SecretLoader,
    issuer: `${config.jwksHost}/`,
    audience: config.jwksAud,
    algorithms: [ 'RS256' ]
  })
}
