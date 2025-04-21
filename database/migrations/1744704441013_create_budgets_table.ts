import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'budgets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').unsigned().primary()
      table.bigInteger('caisse_id')
      .unsigned()
      .references('id')
      .inTable('caisses')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('enterprise_id')
      .nullable()
      .unsigned()
      .references('id')
      .inTable('enterprises')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.text('description').nullable().defaultTo('N/A')

      table.bigInteger('montant').notNullable().defaultTo(0)

      table.bigInteger('created_by').nullable().unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')


      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}