import * as Router from 'koa-router'
import loginUser from './loginUser'

const router = new Router({
  prefix: '/oauth'
})

router.post('/', ...loginUser)

export const routes = router.routes
