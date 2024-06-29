import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class ForbiddenException extends Exception {
  constructor() {
    super("Your account doesn't have access!", {
      code: 'E_FORBIDDEN',
      status: 403,
    })
  }

  async handle(error: this, ctx: HttpContext) {
    return ctx.response.forbidden({
      error: {
        message: error.message,
        code: error.code,
        status: error.status,
      },
    })
  }
}
