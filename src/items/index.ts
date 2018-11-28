import * as Router from 'koa-router'
import getItems from './getItems'

const router = new Router({
  prefix: '/items'
})

router.get('/', ...getItems)

export const routes = () => router.routes()
