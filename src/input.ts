import * as Ajv from 'ajv'
import * as Koa from 'koa'

const ajv = new Ajv()

export function createValidator(schema: any): Koa.Middleware {
  const validate = ajv.compile(schema)

  return async (ctx, next) => {
    // koa-multer issue https://github.com/koa-modules/multer/issues/14
    const req = ctx.req as any

    const input = Object.assign({}, ctx.request.body, ctx.query, req.body)
    if (validate(input)) {
      return await next()
    }

    ctx.throw(422, ajv.errorsText(validate.errors), {
      id: 'INVALID_INPUT'
    })
  }
}
