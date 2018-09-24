import * as Router from 'koa-router'
import createUser from './createUser'

const router = new Router({
  prefix: '/users'
})

router.post('/', createUser)

export const routes = () => router.routes()
