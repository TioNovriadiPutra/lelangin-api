import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class DataNotFoundException extends Exception {
  constructor(data: string) {
    super(`${data} data not found!`, {
      code: 'E_DATA_NOT_FOUND',
      status: 404,
    })
  }

  async handle(error: this, ctx: HttpContext) {
    return ctx.response.notFound({
      error: {
        message: error.message,
        code: error.code,
        status: error.status,
      },
    })
  }
}
