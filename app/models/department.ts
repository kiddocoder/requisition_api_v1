import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Enterprise from './enterprise.js'
import User from './user.js'

export default class Department extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare is_deleted: boolean

  @column()
  declare enterprise_id: number | null

  @column()
  declare created_by: number | null

  @column()
  declare manager_id: number | null

  @column()
  declare employee_count: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'created_by',
    localKey: 'id',
  })
  declare creator: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'manager_id',
    localKey: 'id',
  })
  declare manager: BelongsTo<typeof User>

  @belongsTo(() => Enterprise, {
    foreignKey: 'enterprise_id',
    localKey: 'id',
  })
  declare enterprise: BelongsTo<typeof Enterprise>
}