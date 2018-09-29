import * as Koa from 'koa'

export default function createErrorMiddleware(): Koa.Middleware {
  return async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.status = err.status || 500
      ctx.body = {
        error: err.expose ? err.message : 'Internal Server Error'
      }
      ctx.app.emit('error', err, ctx)
    }
  }
}
