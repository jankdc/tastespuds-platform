import * as Router from 'koa-router';
import * as Controller from './controller';

const router = new Router();
router.get('/users/:userId', Controller.getUserById);
router.post('/users', Controller.createUser);

export const routes = () => router.routes();
