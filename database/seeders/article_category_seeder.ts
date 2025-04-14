import { ArticleCategoryFactory } from '#database/factories/article_category_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development', 'test']
  async run() {
    // Write your database queries inside the run method
    await ArticleCategoryFactory.createMany(10)
  }
}