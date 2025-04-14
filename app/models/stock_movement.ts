import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Supplier from './supplier.js'
import Article from './article.js'
import Stock from './stock.js'

export default class StockMovement extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare article_id: number

  @column()
  declare stock_id: number

  @column()
  declare supplier_id: number

  @column()
  declare quantite: number

  @column()
  declare type: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Define any relationships

  @belongsTo(() => Article, {
    foreignKey: 'article_id',
    localKey: 'id',
  })
  declare article: BelongsTo<typeof Article>

  @belongsTo(() => Stock, {
    foreignKey: 'stock_id',
    localKey: 'id',
  })
  declare stock: BelongsTo<typeof Stock>  

  @belongsTo(() => Supplier, {
    foreignKey: 'supplier_id',
    localKey: 'id',
  })
  declare supplier: BelongsTo<typeof Supplier>

  @belongsTo(() => User, {
    foreignKey: 'user_id',
    localKey: 'id',
  })
  declare user: BelongsTo<typeof User>

  
}