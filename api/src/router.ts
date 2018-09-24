import * as Router from 'koa-router'
import * as Controller from './controller'

const router = new Router()
router.post('/users', Controller.createUser)
router.get('/reviews', Controller.findHottestReviews)

export const routes = () => router.routes()
