import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import  Jwt from 'jsonwebtoken'
import  env  from '#start/env'
import type{ BelongsTo } from '@adonisjs/lucid/types/relations'
import Enterprise from './enterprise.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  @column()
  declare enterprise_id: number

  @column()
  declare post: string

  @column()
  declare role: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare is_temp_password: boolean

  @column()
  declare must_reset_password: boolean

  @column()
  declare password_reset_token: string | null

  @column()
  declare token_created_at: DateTime | null

  @column()
  declare is_deleted: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(()=>Enterprise,{
    foreignKey:'enterprise_id'
  })
  declare enterprise : BelongsTo <typeof Enterprise>

  @computed()
  generateToken = (user: Partial<User>) => {

   return Jwt.sign(
     { id: user.id, email: user.email, enterprise: user.enterprise?.name ,post:user.post},
     env.get('JWT_SECRET'),
     { expiresIn: "30d" }
   );
 };

  static accessTokens = DbAccessTokensProvider.forModel(User)
}