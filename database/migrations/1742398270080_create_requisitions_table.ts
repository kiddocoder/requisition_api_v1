import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'requisitions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').notNullable().unsigned().primary()
      table.text('number').nullable()
      table.dateTime('date').nullable().defaultTo(this.now())
      table.text("titre")
      table.text("objet")

      table.bigInteger("demendeur_id")
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('enterprise_id')
      .unsigned() 
      .nullable()
      .references('id')
      .inTable('enterprises')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.string('next_step').defaultTo('approvisionnement') 

      table.bigInteger('caisse_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('caisses')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('car_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('cars')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')

      table.bigInteger('return_to_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
      
      table.string('priority').nullable()
      table.boolean('approved_accounter').defaultTo(false)
      table.boolean('precured').defaultTo(false) // approvisionne
      table.boolean('approved_direction').defaultTo(false)
      table.string('status').notNullable().defaultTo("draft") //pending,accepted,refused,cancelled,returned
      
      table.boolean('is_deleted').defaultTo(false)
      table.index(["enterprise_id","demendeur_id","car_id","caisse_id"])
      table.timestamps()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}