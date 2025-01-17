import * as Router from 'koa-router'

import addReview from './addReview'
import getReview from './getReview'
import getReviews from './getReviews'
import likeReview from './likeReview'
import addComment from './addComment'
import getComments from './getComments'
import unlikeReview from './unlikeReview'

const router = new Router({
  prefix: '/reviews'
})

router.get('/', ...getReviews)
router.post('/', ...addReview)
router.get('/:reviewId', ...getReview)
router.get('/:reviewId/comments', ...getComments)
router.post('/:reviewId/comments', ...addComment)
router.post('/:reviewId/likes', ...likeReview)
router.delete('/:reviewId/likes/:likeId', ...unlikeReview)

export const routes = () => router.routes()
