import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'documents'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').notNullable().unsigned().primary()
      table.string('name').notNullable()
      table.boolean('required_for_driving').defaultTo(true)
      table.string('description').nullable().defaultTo(" Pas de description pour ce document")
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}