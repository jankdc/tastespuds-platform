import * as Router from 'koa-router'

import * as reviews from './reviews'
import * as assets from './assets'
import * as search from './search'
import * as places from './places'
import * as items from './items'
import * as users from './users'
import * as oauth from './oauth'

import { createCheckJwtMiddleware } from './check-jwt'

const router = new Router()

// Public Endpoints
router.use(oauth.routes())

// Private Endpoints
router.use(createCheckJwtMiddleware());
router.use(items.routes())
router.use(oauth.routes())
router.use(users.routes())
router.use(places.routes())
router.use(assets.routes())
router.use(search.routes())
router.use(reviews.routes())

export const routes = () => router.routes()
