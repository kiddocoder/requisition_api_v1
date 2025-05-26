import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const header = ctx.request.headers().authorization;
    const token = header?.split(' , ')[1];
console.log(token)
    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}