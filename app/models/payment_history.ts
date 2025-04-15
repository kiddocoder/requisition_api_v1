import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Supplier from './supplier.js'
import User from './user.js'

export default class PaymentHistory extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare supplier_id: number

  @column()
  declare user_id: number | null

  @column()
  declare amount: number

  @column()
  declare payment_method: string

  @column()
  declare description: string

  @column.dateTime()
  declare payment_date: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Supplier)
  declare supplier: BelongsTo<typeof Supplier>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}