import Equipment from '#models/equipment'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development', 'testing']
  async run() {
    // Write your database queries inside the run method
    await Equipment.updateOrCreateMany('name', [
      {
        name:'carteRose',
        description:'carteRose'
      },
      {
        name:'spareTire',
        description:'spareTire'
      },
      {
        name:'wheelWrench',
        description:'wheelWrench'
      },
      {
        name:'insurance',
        description:'insurance'
      },
      {
        name:'technicalControl',
        description:'technicalControl'
      },
      {
        name:'firstAidKit',
        description:'firstAidKit'
      },
    ])
  }
}