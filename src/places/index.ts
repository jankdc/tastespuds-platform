import * as Router from 'koa-router'
import getPlaces from './getPlaces'
import addPlace from './addPlace'

const router = new Router({
  prefix: '/places'
})

router.get('/', ...getPlaces)
router.post('/', ...addPlace)

export const routes = () => router.routes()
