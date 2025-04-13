import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Equipment from './equipment.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Document from './document.js'

export default class Car extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare licensePlate: string

  @column()
  declare model: string

  @column()
  declare brand: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Equipment, {
    pivotTable: 'car_equipments',
    pivotForeignKey: 'car_id',
    pivotRelatedForeignKey: 'equipment_id',
    pivotColumns: ['expiry_date', 'is_present'],
  })
  declare equipments: ManyToMany<typeof Equipment>

  @manyToMany(() => Document, {
    pivotTable: 'car_documents',
    pivotForeignKey: 'car_id',
    pivotRelatedForeignKey: 'document_id',
    pivotColumns: ['expiry_date', 'is_present'],
  })
  declare documents: ManyToMany<typeof Document>
}