import * as Router from 'koa-router'
import searchPlaces from './searchPlaces'

const router = new Router({
  prefix: '/search'
})

router.get('/places', ...searchPlaces)

export const routes = () => router.routes()
