import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'requisition_items'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.bigInteger('quantite_recue').defaultTo(0)
      table.string('status').nullable().defaultTo("en_stock")
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}