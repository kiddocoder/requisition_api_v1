import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Enterprise from './enterprise.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'


export default class Caisse extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name:string

  @column()
  declare budget: number

  @column()
 declare solde_actuel:number

 @column()
 declare alimented_by:number | null

 @column()
 declare enterprise_id:number | null

  @column()
  declare is_deleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Enterprise,{
    foreignKey:'enterprise_id',
    localKey:'id'
  })
  declare enterprise: BelongsTo<typeof Enterprise>


  @belongsTo(() => User,{
    foreignKey:'alimented_by',
    localKey:'id'
  })
  declare alimentor: BelongsTo<typeof User>

}