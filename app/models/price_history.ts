import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Article from './article.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class PriceHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare article_id: number

  @column()
  declare prix_unitaire: number

  @column()
  declare quantite: number

  @column()
  declare date: DateTime

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Article, {
    foreignKey: 'article_id',
    localKey: 'id',
  })
  declare article: BelongsTo<typeof Article>
}