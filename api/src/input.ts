import * as Ajv from 'ajv'
import * as Koa from 'koa'

const ajv = new Ajv()

export function createValidator(schema: any): Koa.Middleware {
  const validate = ajv.compile(schema)

  return async (ctx, next) => {
    const input = Object.assign({}, ctx.request.body, ctx.query)
    if (validate(input)) {
      return await next()
    }

    ctx.throw(422, {
      error: 'invalid-input',
      description: ajv.errorsText(validate.errors)
    })
  }
}
