import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Enterprise from './enterprise.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'


export default class Caisse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name:string

  @column()
  declare budget: number

  @column()
  declare is_deleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Enterprise)
  declare nterprise: BelongsTo<typeof Enterprise>

}