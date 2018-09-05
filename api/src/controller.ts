import * as Koa from 'koa';

export async function getUserById(ctx: Koa.Context) {
  ctx.body = 'Hello, user!';
}
