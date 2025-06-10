import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, computed, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Enterprise from './enterprise.js'
import RequisitionItem from './requisition_item.js'
import RequisitionAttachment from './requisition_attachment.js'
import RequisitionComment from './requisition_comment.js'
import Article from './article.js'
import Caisse from './caisse.js'

export default class Requisition extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare number: string

  @column.date()
  declare date: DateTime

  @column()
  declare titre: string 

  @column()
  declare next_step: string 

  @column()
  declare objet: string

  @column()
  declare priority: 'low' | 'normal' | 'high' 

  @column()
  declare status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'returned' |'precured'

  @column()
  declare demendeur_id: number 
  
  @column()
  declare enterprise_id: number

  @column()
  declare approved_direction:boolean

  @column()
  declare precured:boolean

  @column()
  declare approved_accounter:boolean

   @column()
  declare caisse_id:number | null

  @column()
  declare precured_at : DateTime | null

  @column()
  declare approved_at : DateTime | null

  @column()
  declare completed_at : DateTime | null

  @column()
  declare rejected_at : DateTime | null

  @column()
  declare is_deleted: boolean 

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static async generateNumber(requisition: Requisition) {
    const year = DateTime.now().year.toString().slice(2)
    const lastNumber = await Requisition.query()
      .whereRaw(`number LIKE '${year}-%'`)
      .orderBy('number', 'desc')
      .first()
    const number = lastNumber ? parseInt(lastNumber.number.split('-')[1]) + 1 : 1
    requisition.number = `${year}-${number.toString().padStart(8, '0')}`
  }

  // Relationships
  @manyToMany(() => Article, {
    pivotTable: 'requisition_items',
    localKey: 'id',
    pivotForeignKey: 'requisition_id',
    relatedKey: 'id',
    pivotRelatedForeignKey: 'article_id',
    pivotColumns: [
      'quantite_demande',
      'quantite_recue',
      'prix_unitaire',
      'status',
      'prix_total',
      'transaction_type',
      'avance_credit',
      'supplier_id',
      'is_deleted'
    ]
  })
  declare articles: ManyToMany<typeof Article>

  @belongsTo(() => Enterprise,{
    foreignKey:'enterprise_id'
  })
  declare enterprise: BelongsTo<typeof Enterprise>

   @belongsTo(() => Caisse,{
    foreignKey:'caisse_id'
  })
  declare caisse: BelongsTo<typeof Caisse>

  @hasMany(() => RequisitionItem,{
    foreignKey:'requisition_id',
  })
 declare items: HasMany<typeof RequisitionItem>

  @hasMany(() => RequisitionComment,{
    foreignKey:'requisition_id'
  })
  declare comments: HasMany<typeof RequisitionComment>

  @hasMany(() => RequisitionAttachment,{
    foreignKey:'requisition_id'
  })
  declare attachments: HasMany<typeof RequisitionAttachment>

  @belongsTo(()=>User,{
    foreignKey:'demendeur_id'
  })
  declare demendeur:BelongsTo<typeof User>

  @computed()
  get total() {
    return this.items?.reduce((sum, item) => sum + Number(item.prix_total || 0), 0) || 0
  }
}