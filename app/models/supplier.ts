import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Supplier extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name:string

  @column()
  declare address:string

  @column()
  declare phone:string

  @column()
  declare is_deleted:boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}