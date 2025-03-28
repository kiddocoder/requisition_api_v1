import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'requisition_attachments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').notNullable().unsigned().primary()
      table.bigInteger("requisition_id")
      .unsigned()
      .references('id')
      .inTable('requisitions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.string('file_name').notNullable()
      table.string('url').notNullable()
      table.string('file_type').notNullable()
      table.boolean('is_deleted').defaultTo(false)
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}