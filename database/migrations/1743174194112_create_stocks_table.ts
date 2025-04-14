import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stocks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      table
        .bigInteger('article_id')
        .unsigned()
        .references('id')
        .inTable('articles')
        .onDelete('CASCADE')

        table
        .bigInteger('supplier_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('suppliers')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      table
        .bigInteger('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      table.bigInteger('quantite').defaultTo(0)
      table.bigInteger('prix_unitaire').defaultTo(0)
      table.bigInteger('prix_total').defaultTo(0)
      table.bigInteger('avance_credit').defaultTo(0)
      table.string('transaction_type').defaultTo("cash") // cash ou credit,
      table.enum('status', ['en_stock', 'stock_faible', 'rupture_de_stock']).defaultTo("en_stock")

      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
