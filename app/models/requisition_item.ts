import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Requisition from './requisition.js'
import Article from './article.js'
import Supplier from './supplier.js'
import { DateTime } from 'luxon'

export default class RequisitionItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare requisition_id: number

  @column()
  declare article_id: number

  @column()
  declare quantite_demande: number

  @column()
  declare status: string

  @column()
  declare quantite_recue: number

  @column()
  declare prix_unitaire: number 

  @column()
  declare prix_total: number

  @column()
  declare transaction_type: string | null

  @column()
  declare avance_credit: number

  @column()
  declare supplier_id: number | null

  @column()
  declare is_deleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships
  @belongsTo(() => Requisition,{
    foreignKey:'requisition_id'
  })
  declare requisition: BelongsTo<typeof Requisition>

  @belongsTo(() => Article,{
    foreignKey:'article_id'
  })
  declare article: BelongsTo<typeof Article>

  @belongsTo(() => Supplier,{
    foreignKey:'supplier_id'
  })
  declare supplier: BelongsTo<typeof Supplier>
}