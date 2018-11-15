import * as Router from 'koa-router'
import getMe from './getMe'

const router = new Router({
  prefix: '/me'
})

router.get('/', ...getMe)

export const routes = () => router.routes()
