import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class ValidationException extends Exception {
  messages: any

  constructor(messages: any) {
    super('', {
      code: 'E_VALIDATION',
      status: 422,
    })

    this.messages = messages
  }

  async handle(error: this, ctx: HttpContext) {
    return ctx.response.unprocessableEntity({
      error: {
        message: this.messages,
        code: error.code,
        status: error.status,
      },
    })
  }
}
