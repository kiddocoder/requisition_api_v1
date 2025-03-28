import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Requisition from './requisition.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class RequisitionAttachment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare requisition_id: number

  @column()
  declare file_name: string

  @column()
  declare file_type: string

  @column()
  declare url: string

  @column()
  declare is_deleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(()=>Requisition,{
    foreignKey:'requisition_id',
  })
  declare requisition : BelongsTo<typeof Requisition>
}