import * as Router from 'koa-router'
import getReviews from './getReviews'

const router = new Router({
  prefix: '/reviews'
})

router.get('/', ...getReviews)

export const routes = () => router.routes()
