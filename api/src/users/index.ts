import * as Router from 'koa-router'
import getUsers from './getUsers'

const router = new Router({
  prefix: '/users'
})

router.get('/', ...getUsers)

export const routes = () => router.routes()
