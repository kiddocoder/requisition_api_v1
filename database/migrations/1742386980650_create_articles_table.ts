import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'articles'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('id').notNullable().unsigned().primary()
      table.string('unique_id',25).nullable()

      table.bigInteger('category_id')
      .nullable()
      .unsigned()
      .references('id')
      .inTable('article_categories')
      .onDelete('SET NULL')
      .onUpdate('CASCADE')
    
      table.string('name').notNullable()
      table.string('reference').nullable()
      table.string('unite_mesure').defaultTo("N/A")
      table.string('description').nullable().defaultTo(" Pas de description")
      table.string('image').nullable()
      table.string('image_name').nullable()

      table.bigInteger('prix_unitaire').defaultTo(0)
      table.bigInteger('quantite').defaultTo(0)
      table.bigInteger('quantite_restante').defaultTo(0)
      table.string('status').defaultTo("en_stock") // en_stock, stock_faible, rupture_de_stock

      table.boolean('is_deleted').defaultTo(false)
      table.timestamps()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
