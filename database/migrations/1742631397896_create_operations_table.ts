import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'operations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').unsigned().notNullable().primary()

      table.bigInteger('caisse_id')
      .nullable()
        .unsigned()
        .references('id')
        .inTable('caisses')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      table.bigInteger('user_id')
      .nullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      table.bigInteger('amount').defaultTo(0)
      table.bigInteger('operation_type_id')
      .nullable()
        .unsigned()
        .references('id')
        .inTable('operation_types')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.text('description').nullable()
      table.boolean('is_deleted').defaultTo(false)
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
