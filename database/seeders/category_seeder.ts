import Category from '#models/category'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Category.createMany([
      {
        categoryName: 'Automotive',
      },
      {
        categoryName: 'Clothing',
      },
      {
        categoryName: 'Music',
      },
      {
        categoryName: 'Technology',
      },
      {
        categoryName: 'Accessories',
      },
      {
        categoryName: 'Entertainment',
      },
    ])
  }
}
