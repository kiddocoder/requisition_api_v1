import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cars'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').notNullable().unsigned().primary()
      table.string('name').notNullable()
      table.string('license_plate').notNullable()
      table.string('model').notNullable()
      table.string('brand').notNullable()
      table.string('description').notNullable()
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}