import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'departments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').unsigned().primary()
      table.string('name').notNullable()
      table.string('description').nullable().defaultTo(" Pas de description pour ce département")
      table.bigInteger('enterprise_id')
      .unsigned()
      .references('id')
      .inTable('enterprises')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      table.bigInteger('employee_count').defaultTo(0)
      table.bigInteger('manager_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.boolean('is_deleted').defaultTo(false)
      table.bigInteger('created_by').nullable().unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')

      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}