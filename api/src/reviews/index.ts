import * as Router from 'koa-router'

import addReview from './addReview'
import getReviews from './getReviews'

const router = new Router({
  prefix: '/reviews'
})

router.get('/', ...getReviews)
router.post('/', ...addReview)

export const routes = () => router.routes()
