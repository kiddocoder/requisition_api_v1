import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Article from './article.js'
import type{ BelongsTo } from '@adonisjs/lucid/types/relations'

export default class RequisitionItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare requisition_id:number

  @column()
  declare article_id:number

  @column()
  declare designation: string

  @column()
  declare quantite_demande: number

  @column()
  declare unite_mesure: string

  @column()
  declare prix_unitaire: number


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(()=>Article,{
    foreignKey:'article_id'
  })
  declare article :BelongsTo<typeof Article>
}