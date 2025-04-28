import { DateTime } from 'luxon'
import { BaseModel, column, hasMany,computed } from '@adonisjs/lucid/orm'
import Budget from './budget.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Caisse from './caisse.js'

export default class Enterprise extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare is_deleted :boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(()=> Budget,{
    localKey:'id',
    foreignKey:'enterprise_id'
  })
  declare budgets:HasMany<typeof Budget>


  @hasMany(()=>Caisse,{
    localKey:'id',
    foreignKey:'enterprise_id'
  })
  declare caisses:HasMany<typeof Caisse>

  @computed()
  get budgetsCount(){
    return this.budgets?.length || 0;
  }

  @computed()
  get totalBudget(){
    return this.budgets?.reduce((total, budget) => {
      return total + budget.montant
    }, 0) || 0
  }
  
}