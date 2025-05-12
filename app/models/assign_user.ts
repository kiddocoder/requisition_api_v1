import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Enterprise from './enterprise.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Department from './department.js'

export default class AssignUser extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare enterprise_id: number

  @column()
  declare department_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Enterprise)
  declare enterprise: BelongsTo<typeof Enterprise>

  @belongsTo(() => Department)
  declare department: BelongsTo<typeof Department>
}