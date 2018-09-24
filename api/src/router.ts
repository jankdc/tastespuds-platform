import * as Router from 'koa-router'
import * as review from './review'
import * as user from './user'

const router = new Router()
router.use(user.routes())
router.use(review.routes())

export const routes = () => router.routes()
