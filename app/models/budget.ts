import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Caisse from './caisse.js'
import Enterprise from './enterprise.js'

export default class Budget extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare caisse_id:number

  @column()
  declare montant:number

  @column()
  declare description:string

  @column()
  declare created_by:number | null

  @column()
  declare enterprise_id:number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(()=>User,{
    foreignKey:'created_by',
    localKey:'id'
  })
  declare creator:BelongsTo<typeof User>

  @belongsTo(()=>Caisse,{
    foreignKey:'caisse_id',
    localKey:'id'
  })
  declare caisse:BelongsTo<typeof Caisse>

    @belongsTo(()=>Enterprise,{
      foreignKey:'enterprise_id',
      localKey:'id'
    })
    declare enterprise: BelongsTo<typeof Enterprise>
  
}