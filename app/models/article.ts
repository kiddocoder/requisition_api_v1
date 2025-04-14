import {  BaseModel, beforeCreate, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Requisition from './requisition.js'
import Stock from './stock.js'

export default class Article extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare uniqueId: string

  @column()
  declare reference : string

  @column()
  declare unite_mesure: string 

  @column()
  declare description: string | null

  @column()
  declare image: string | null

  @column()
  declare image_name: string | null 

  @column()
  declare isDeleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static async generateUniqueId(article: Article) {
    const randomPart = Math.random().toString(36).substring(1, 4).padStart(3, '0');
    article.uniqueId = randomPart;
  }

  @manyToMany(() => Requisition, {
    pivotTable: 'requisition_items',
    localKey: 'id',
    pivotForeignKey: 'article_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'requisition_id',
    pivotColumns: [
      'quantite_demande',
      'prix_unitaire',
      'prix_total',
      'transaction_type',
      'avance_credit',
      'supplier_id',
      'is_deleted'
    ]
  })
  declare requisitions: ManyToMany<typeof Requisition>

  @hasMany(() => Stock, {
    foreignKey: 'article_id',
    localKey: 'id',
  })
  declare stocks: HasMany<typeof Stock>
}