import * as Koa from 'koa'

export default function createErrorMiddleware(): Koa.Middleware {
  return async (ctx, next) => {
    try {
      await next()
    } catch (err) {
      ctx.status = err.status || 500

      ctx.body = {
        error: err.expose ? err.id : 'INTERNAL_SERVER_ERROR',
        description: err.expose ? err.message : 'Oops, we did an oopsie!'
      }

      if (err.params) {
        ctx.body.params = err.params
      }

      ctx.app.emit('error', err, ctx)
    }
  }
}
