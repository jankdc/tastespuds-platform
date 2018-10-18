import * as Router from 'koa-router'
import * as multer from 'koa-multer'

import addAsset from './addAsset'

const router = new Router({
  prefix: '/assets'
})

const upload = multer()

router.post('/', upload.single('file'), ...addAsset)

export const routes = () => router.routes()
