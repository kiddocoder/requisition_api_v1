import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'requisition_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').notNullable().unsigned().primary()
      table.bigInteger("requisition_id")
      .unsigned()
      .references('id')
      .inTable('requisitions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      

      table.string('designation').notNullable()
      table.bigInteger('quantite_demande').notNullable()
      table.string('unite_mesure').notNullable()
      table.bigInteger('prix_unitaire').notNullable()
      table.bigInteger('prix_total').notNullable()
      table.string('priority').notNullable()
      table.string('type_transaction').notNullable()

      table.bigInteger('supplier_id')
      .unsigned()
      .references('id')
      .inTable('suppliers')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.boolean('is_deleted').defaultTo(false)
      table.timestamps()
      table.index(["requisition_id","supplier_id"])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}