import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'articles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').notNullable().unsigned().primary()
      table.string('name').notNullable()
      table.string('unite_mesure').defaultTo("N/A")
      table.string('description').nullable().defaultTo(" Pas de description")
      table.string('image').nullable()
      table.string('image_name').nullable()
      table.boolean('is_deleted').defaultTo(false)
      table.timestamps()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
