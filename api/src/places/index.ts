import * as Router from 'koa-router'
import getPlaces from './getPlaces'

const router = new Router({
  prefix: '/places'
})

router.get('/', ...getPlaces)

export const routes = () => router.routes()
