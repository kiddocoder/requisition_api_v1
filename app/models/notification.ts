import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type{ BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Notification extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number | null

  @column()
  declare to : string

  @column()
  declare type: string

  @column()
  declare title: string

  @column()
  declare message: string

  @column()
  declare icon: string

  @column()
  declare link: string

  @column()
  declare date:  DateTime

  @column()
  declare is_read: boolean

  @column()
  declare is_deleted: boolean


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'user_id',
    localKey: 'id',
  })
  declare user: BelongsTo<typeof User>
}