import * as Koa from 'koa';

export default function createErrorMiddleware(): Koa.Middleware {
  return async function errorMiddleware(ctx: Koa.Context, next: Function) {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.expose ? err.message : 'Internal Server Error';
      ctx.app.emit('error', err, ctx);
    }
  }
}
