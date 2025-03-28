import OperationType from '#models/operation_type'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development', 'testing']
  async run() {
    // Write your database queries inside the run method
    await OperationType.createMany([
      {
        name:"incomes",
        description:"incomes"
      },
      {
        name:"expenses",
        description:"expenses"
      },
      {
        name:"transfers",
        description:"transfers"
      },
      {
        name:"deposits",
        description:"deposits"
      },
      {
        name:"withdrawals",
        description:"withdrawals"
      }
    ])
  }
}