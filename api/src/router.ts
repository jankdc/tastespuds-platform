import * as Router from 'koa-router'
import * as reviews from './reviews'
import * as users from './users'

const router = new Router()
router.use(users.routes())
router.use(reviews.routes())

export const routes = () => router.routes()
