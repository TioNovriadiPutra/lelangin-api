import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class UnauthorizedException extends Exception {
  constructor() {
    super('Access denied!', {
      code: 'E_UNAUTHORIZED',
      status: 401,
    })
  }

  async handle(error: this, ctx: HttpContext) {
    return ctx.response.unauthorized({
      error: {
        message: error.message,
        code: error.code,
        status: error.status,
      },
    })
  }
}
