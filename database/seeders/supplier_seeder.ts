import { SupplierFactory } from '#database/factories/supplier_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
    await SupplierFactory.createMany(10)
  }
}