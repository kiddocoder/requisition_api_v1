import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Supplier from './supplier.js'
import Article from './article.js'
import User from './user.js'

export default class Stock extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare supplier_id:number

  @column()
  declare article_id:number

  @column()
  declare user_id:number

  @column()
  declare quantite: number

  @column()
  declare prix_unitaire: number

  @column()
  declare prix_total: number

  @column()
  declare avance_credit: number

  @column()
  declare transaction_type: string // cash ou credit

  @column()
  declare status: string // en_stock, stock_faible, rupture_de_stock
  
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