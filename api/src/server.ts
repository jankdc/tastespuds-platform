import * as Koa from 'koa';
import * as http from 'http';
import * as bodyParser from 'koa-bodyparser';

import errors from './errors';
import shutdown from './shutdown';
import { routes } from './router';

const app = new Koa();
const server = http.createServer(app.callback());

app.use(errors());
app.use(shutdown(server));
app.use(bodyParser());
app.use(routes());

export default server;
