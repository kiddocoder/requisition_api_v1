import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'caisses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').notNullable().unsigned().primary()

      table.bigInteger('enterprise_id')
      .unsigned()
      .references('id')
      .inTable('enterprises')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('budget').defaultTo(0)

      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}