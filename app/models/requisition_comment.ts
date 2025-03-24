import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Requisition from './requisition.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class RequisitionComment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare requisition_id:number

  @column()
  declare user_id:number

  @column()
  declare comment: string

  @column()
  declare is_deleted: boolean

  @column()
  declare is_public: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(()=>Requisition,{
    foreignKey:"requisition_id"
  })
  declare requisition:BelongsTo<typeof Requisition>
}