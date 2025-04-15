import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'payment_histories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').unsigned().primary()

      table.bigInteger('supplier_id')
      .unsigned()
      .references('id')
      .inTable('suppliers')
      .notNullable()
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('user_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('amount').notNullable().defaultTo(0)
      table.string('payment_method', 50).notNullable()
      table.text('description').nullable()

      table.timestamp('payment_date').nullable()
      table.timestamps()

      table.index(['supplier_id'], 'payment_histories_supplier_id_index')
      table.index(['user_id'], 'payment_histories_user_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}