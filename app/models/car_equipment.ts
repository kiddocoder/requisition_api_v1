import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Equipment from './equipment.js'
import Car from './car.js'
import type{ BelongsTo } from '@adonisjs/lucid/types/relations'

export default class CarEquipment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare car_id: number

  @column()
  declare equipment_id: number

  @column()
  declare expiry_date: Date

  @column()
  declare is_present: boolean
  

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Car,{
    foreignKey:'car_id'
  })
  declare car: BelongsTo<typeof Car>

  @belongsTo(() => Equipment,{
     foreignKey:'equipment_id'
  })
  declare equipment: BelongsTo<typeof Equipment>
}