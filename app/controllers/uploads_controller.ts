// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { normalize, sep } from 'node:path'

const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/

export default class UploadsController {
  async getUserUpload({ request, response }: HttpContext) {
    const filePath = request.param('*').join(sep)
    const normalizedPath = normalize(filePath)

    if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
      return response.badRequest('Malformed path')
    }

    const absolutePath = app.makePath('uploads/users', normalizedPath)
    return response.download(absolutePath)
  }
}
