import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Car from './car.js'
import Document from './document.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class CarDocument extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare car_id: number

  @column()
  declare document_id: number

  @column()
  declare expiry_date: Date

  @column()
  declare is_present: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Car,{
    foreignKey:"car_id"
  })
  declare car: BelongsTo<typeof Car>

  @belongsTo(() => Document,{
    foreignKey:"document_id"
  })
  declare document: BelongsTo<typeof Document>
}