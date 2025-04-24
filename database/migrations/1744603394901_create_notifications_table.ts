import { BaseSchema } from '@adonisjs/lucid/schema'
import { DateTime } from 'luxon'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').unsigned().primary()

      table.bigInteger('user_id').nullable().unsigned().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE')

      table.string('to').nullable().defaultTo('all')//all, admin, user

      table.string('title').notNullable()

      table.string('message').notNullable()

      table.string('type').notNullable()  //

      table.string('link').nullable().defaultTo('#')

      table.string('icon').nullable() 

      table.boolean('is_read').defaultTo(false)
      
      table.boolean('is_archived').defaultTo(false) 
      
      table.boolean('is_deleted').defaultTo(false) 

      table.dateTime('date').defaultTo(DateTime.now().toSQLDate()) 

      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}