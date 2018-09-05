import * as Router from 'koa-router';
import * as Controller from './controller';

const router = new Router();
router.get('/users/:userId', Controller.getUserById);

export const routes = () => router.routes();
