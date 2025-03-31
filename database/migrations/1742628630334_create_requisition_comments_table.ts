import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'requisition_comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').unsigned().notNullable().primary()

      table.bigInteger('requisition_id')
      .unsigned()
      .references('id')
      .inTable('requisitions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      table.bigInteger('user_id')
      .nullable()
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      table.string('author').defaultTo('utilisateur')
      table.text('comment')
      table.boolean('is_deleted').defaultTo(false)
      table.boolean('is_public').defaultTo(true)
      table.index(["requisition_id", "user_id"])
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}