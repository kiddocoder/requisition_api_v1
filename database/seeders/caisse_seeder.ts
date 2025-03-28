import { CaisseFactory } from '#database/factories/caisse_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development', 'testing']
  async run() {
    // Write your database queries inside the run method
    await CaisseFactory.createMany(5)
  }
}