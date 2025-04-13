import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'car_equipments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').notNullable().unsigned().primary()
      table.bigInteger('car_id')
      .unsigned()
      .references('id')
      .inTable('cars')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('equipment_id')
      .unsigned()
      .references('id')
      .inTable('equipments')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      
      table.date('expiry_date').nullable()
      table.boolean('is_present').defaultTo(false)

      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

