import * as Koa from 'koa'
import * as jwt from 'koa-jwt'
import * as rsa from 'koa-rsa'

import * as config from './config'

export function createCheckJwtMiddleware(): Koa.Middleware {
  return jwt({
    secret: rsa.koaJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 2,
      jwksUri: `${config.jwksHost}/.well-known/jwks.json`
    }),
    audience: config.jwksAudience,
    issuer: `${config.jwksHost}/`,
    algorithms: [ 'RS256' ]
  })
}
