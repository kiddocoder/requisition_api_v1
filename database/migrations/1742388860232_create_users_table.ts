import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').notNullable().unsigned().primary()
      table.string('username').notNullable()
      table.bigInteger('enterprise_id')
      .nullable()
      .unsigned()
      .references('id')
      .inTable('enterprises')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      table.string('post').notNullable().defaultTo("")
      table.string('role').notNullable().defaultTo("user")
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.boolean('is_temp_password').defaultTo(false)
     table.boolean('must_reset_password').defaultTo(false)
      table.string('password_reset_token').nullable()
      table.string('token_created_at').nullable()
      table.boolean('is_deleted').defaultTo(false)
      table.timestamps()
      table.index('enterprise_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}