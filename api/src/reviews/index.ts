import * as Router from 'koa-router'

import addReview from './addReview'
import getReviews from './getReviews'
import likeReview from './likeReview'

const router = new Router({
  prefix: '/reviews'
})

router.get('/', ...getReviews)
router.post('/', ...addReview)
router.post('/:reviewId/likes', ...likeReview)

export const routes = () => router.routes()
