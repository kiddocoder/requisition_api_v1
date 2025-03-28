import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Article from './article.js'
import type{ BelongsTo } from '@adonisjs/lucid/types/relations'
import Requisition from './requisition.js'

export default class RequisitionItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare requisition_id:number

  @column()
  declare article_id:number

  @column()
  declare quantite_demande: number

  @column()
  declare prix_unitaire: number

  @column()
  declare prix_total: number   

  @column()
  declare transaction_type: string 

  @column()
  declare avance_credit: number

  @column()
  declare supplier_id: number

  @column()
  declare is_deleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(()=>Article,{
    foreignKey:'article_id'
  })
  declare article :BelongsTo<typeof Article>

  @belongsTo(()=>Requisition,{
    foreignKey:'requisition_id'
  })
  declare requisition:BelongsTo<typeof Requisition>
}