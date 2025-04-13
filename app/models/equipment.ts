import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Car from './car.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Equipment extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  @manyToMany(() => Car, {
    pivotTable: 'car_equipment',
    localKey: 'id',
    pivotForeignKey: 'equipment_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'car_id',
  })
  declare cars: ManyToMany<typeof Car>
}