import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import OperationType from './operation_type.js'
import Caisse from './caisse.js'
import Enterprise from './enterprise.js'

export default class Operation extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare operation_type_id:number | null

  @column()
  declare user_id:number | null

  @column()
  declare caisse_id:number | null

  @column()
  declare enterprise_id:number | null

  @column()
  declare amount :number

  @column()
  declare description: string

  @column()
  declare is_deleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(()=>OperationType,{
    foreignKey:"operation_type_id"
  })
  declare operation_type:BelongsTo<typeof OperationType>

  @belongsTo(()=>User,{
    foreignKey:"user_id"
  })
  declare user:BelongsTo<typeof User>

  @belongsTo(()=>Caisse,{
    foreignKey:"caisse_id"
  })
  declare caisse:BelongsTo<typeof Caisse>

    @belongsTo(()=>Enterprise,{
      foreignKey:'enterprise_id',
      localKey:'id'
    })
    declare enterprise: BelongsTo<typeof Enterprise>
  
}