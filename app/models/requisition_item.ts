import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class RequisitionItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare requisition_id:number

  @column()
  declare designation: string

  @column()
  declare quantite_demande: number

  @column()
  declare unite_mesure: string

  @column()
  declare prix_unitaire: number


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}