import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Enterprise from './enterprise.js'
import RequisitionItem from './requisition_item.js'

export default class Requisition extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare date: string

  @column()
  declare titre: string

  @column()
  declare objet: string

  @column()
  declare status: string

  @column()
  declare demendeur_id: number

  @column()
  declare enterprise_id: number

  @column()
  declare is_deleted:boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'demendeur_id',
  })
  declare demendeur: BelongsTo<typeof User>

  @belongsTo(() => Enterprise, {
    foreignKey: 'enterprise_id',
  })
  declare enterprise: BelongsTo<typeof Enterprise>

  @hasMany(() => RequisitionItem,{
    foreignKey:'requisition_id'
  })
  declare items: HasMany<typeof RequisitionItem>

}