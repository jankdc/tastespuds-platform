import * as Router from 'koa-router'
import getUsers from './getUsers'
import getUser from './getUser'

const router = new Router({
  prefix: '/users'
})

router.get('/', ...getUsers)
router.get('/:username', ...getUser)

export const routes = () => router.routes()
