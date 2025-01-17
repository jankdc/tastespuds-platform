import * as Router from 'koa-router'
import * as multer from 'koa-multer'

import addAsset from './addAsset'
import getAsset from './getAsset'

const router = new Router({
  prefix: '/assets'
})

const upload = multer()

router.post('/', upload.single('file'), ...addAsset)
router.get('/:assetId', ...getAsset)

export const routes = () => router.routes()
