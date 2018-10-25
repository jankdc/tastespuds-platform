import * as Router from 'koa-router'

import addReview from './addReview'
import getReviews from './getReviews'
import likeReview from './likeReview'
import unlikeReview from './unlikeReview'

const router = new Router({
  prefix: '/reviews'
})

router.get('/', ...getReviews)
router.post('/', ...addReview)
router.post('/:reviewId/likes', ...likeReview)
router.delete('/:reviewId/likes/:likeId', ...unlikeReview)

export const routes = () => router.routes()
