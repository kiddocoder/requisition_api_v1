import Document from '#models/document'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development', 'testing']
  async run() {
    // Write your database queries inside the run method

    await Document.updateOrCreateMany('name', [
      {
        name:'carteRose',
        description:'carteRose'
      },
      {
        name:'insurance',
        description:'insurance'
      },
      {
        name:'technicalControl',
        description:'technicalControl'
      }
    ])
  }
}