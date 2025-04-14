import { BaseSchema } from '@adonisjs/lucid/schema'
import { DateTime } from 'luxon'

export default class extends BaseSchema {
  protected tableName = 'price_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').unsigned().primary()
      table.bigInteger('article_id').unsigned().references('id').inTable('articles').onDelete('CASCADE').onUpdate('CASCADE')
      
      table.bigInteger('prix_unitaire').defaultTo(0)
     
      table.bigInteger('quantite').defaultTo(0)

      table.dateTime('date').defaultTo(DateTime.now().toSQLDate())

      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}