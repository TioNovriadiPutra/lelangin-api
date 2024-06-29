import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class CategoriesController {
  async getCategories({ response }: HttpContext) {
    const categoryData = await db.rawQuery(
      `SELECT
        id,
        category_name
       FROM categories`
    )

    return response.ok({
      message: 'Data fetched!',
      data: categoryData[0],
    })
  }
}
