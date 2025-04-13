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
    pivotTable: 'car_equipment',
    localKey: 'id',
    pivotForeignKey: 'car_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'equipment_id',
  })
  declare equipments: ManyToMany<typeof Equipment>

  @manyToMany(() => Document, {
    pivotTable: 'car_document',
    localKey: 'id',
    pivotForeignKey: 'car_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'document_id',
  })
  declare documents: ManyToMany<typeof Document>
}