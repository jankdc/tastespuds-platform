import * as env from 'env-var'

export const port = env.get('PORT')
  .required()
  .asIntPositive()

export const nodeEnv = env.get('NODE_ENV')
  .required()
  .asEnum(['development', 'production'])

export const jwksAud = env.get('JWKS_AUD')
  .required()
  .asString()

export const jwksHost = env.get('JWKS_HOST')
  .required()
  .asUrlString()

export const databaseUrl = env.get('DATABASE_URL')
  .required()
  .asString()

export const streamJsApiKey = env.get('STREAMJS_API_KEY')
  .required()
  .asString()

export const streamJsApiSecret = env.get('STREAMJS_API_SECRET')
  .required()
  .asString()

export const auth0ClientId = env.get('AUTH0_CLIENT_ID')
  .required()
  .asString()

export const auth0DomainUrl = env.get('AUTH0_DOMAIN_URL')
  .required()
  .asUrlString()

export const auth0RedirectUrl = env.get('AUTH0_REDIRECT_URL')
  .required()
  .asUrlString()

export const auth0ClientSecret = env.get('AUTH0_CLIENT_SECRET')
  .required()
  .asString()

export const googlePlacesApiKey = env.get('GOOGLE_PLACES_API_KEY')
  .required()
  .asString()

export const auth0UsersClientId = env.get('AUTH0_USERS_CLIENT_ID')
  .required()
  .asString()

export const auth0UsersClientSecret = env.get('AUTH0_USERS_CLIENT_SECRET')
  .required()
  .asString()
