import { CarFactory } from '#database/factories/car_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await CarFactory.createMany(5)
  }
}