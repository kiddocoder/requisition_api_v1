import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'requisition_items'

  async up() {
    // this.schema.alterTable(this.tableName, (table) => {
    //   //  table.bigInteger('unit_price').defaultTo(0)

      // table.boolean('accepted').defaultTo(true)  /* 'direction'*/

    //   // table.bigInteger('nouveau_prix').defaultTo(0)

    // })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}