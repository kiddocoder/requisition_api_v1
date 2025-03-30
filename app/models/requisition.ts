import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Enterprise from './enterprise.js'
import RequisitionItem from './requisition_item.js'
import RequisitionAttachment from './requisition_attachment.js'


export default class Requisition extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare number:string | null

  @column()
  declare date: DateTime | null

  @column()
  declare titre: string

  @column()
  declare objet: string

  @column()
  declare priority: string 


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

  @beforeCreate()
  static generateNumber(requisition: Requisition){
    requisition.number = `REQ-${DateTime.now().toFormat('yyMMddHHmmss')}`
  }

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

  @hasMany(() => RequisitionAttachment,{
    foreignKey:'requisition_id'
  })
  declare attachments: HasMany<typeof RequisitionAttachment>

  @computed()
  get total(){
    return Math.round(this.items?.reduce((t,req)=>t+Number(req.prix_total),0) || 0)
  }
}