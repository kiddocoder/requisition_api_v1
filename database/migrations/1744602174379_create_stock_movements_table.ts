import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stock_movements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').unsigned().primary()

      table.bigInteger('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('article_id')
      .unsigned()
      .references('id')
      .inTable('articles')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('stock_id')
      .unsigned()
      .references('id')
      .inTable('stocks')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('supplier_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('suppliers')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      

      table.string('type').defaultTo("entree") // entree ou sortie
      table.bigInteger('quantite').defaultTo(0)

      table.string('description').nullable()

      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}