import * as Router from 'koa-router'
import * as reviews from './reviews'
import * as places from './places'
import * as users from './users'
import * as oauth from './oauth'

const router = new Router()
router.use(oauth.routes())
router.use(users.routes())
router.use(places.routes())
router.use(reviews.routes())

export const routes = () => router.routes()
