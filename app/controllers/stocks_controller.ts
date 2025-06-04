import Article from '#models/article';
import PaymentHistory from '#models/payment_history';
import PriceHistory from '#models/price_history';
import Stock from '#models/stock';
import StockMovement from '#models/stock_movement';
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';

export default class StocksController {

  private getStockStatus(quantity: number): string {
    if (quantity <= 0) return 'rupture_de_stock'
    if (quantity < 10) return 'stock_faible'
    return 'en_stock'
  }

  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const stocks = await Stock.query()
    .preload('article')
    .preload('supplier')
    .preload('user')
    .orderBy('created_at', 'desc')
    .exec();

    return response.send(stocks || [])
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const trx = await db.transaction()
  
    try {
      const { items, user_id } = request.all() as {
        items: Array<{
          article_id: number
          quantite: number
          prix_unitaire: number
          prix_total: number
          supplier_id: number
          transaction_type: 'cash' | 'credit'
          avance_credit?: number
        }>
        user_id: number
      }
  
      // Track payments for cash transactions by supplier
      const supplierPayments: Record<number, number> = {}
  
      // Process each stock item
      for (const item of items) {
        const { 
          article_id, 
          quantite, 
          prix_unitaire, 
          prix_total, 
          supplier_id,
          transaction_type,
          avance_credit = 0 
        } = item
  
        // Check if article exists in stock 
        const existingArticle = await Article.query({ client: trx })
          .where('id', article_id)
          .orderBy('created_at', 'desc')
          .first()
  
        if (existingArticle) {
          // Save old price to price history
          await PriceHistory.create(
            {
              article_id,
              prix_unitaire: prix_unitaire,
              quantite:quantite,
              date: DateTime.now(),
              description: `Prix avant mise à jour (${existingArticle.prix_unitaire} BIF)`,
            },
            { client: trx }
          )
  
          // Update existing article
          const newQuantity = Number(existingArticle.quantite) + Number(quantite)
          const remainingQuantity = Number(newQuantity) - Number(existingArticle.quantite_restante);

          await existingArticle
            .merge({
              quantite: newQuantity,
              prix_unitaire,
              quantite_restante:remainingQuantity,
              status: this.getStockStatus(newQuantity),
            })
            .useTransaction(trx)
            .save()

          await existingArticle.useTransaction(trx).save()

          // existing stock for this supplier
            const existingStock = await Stock.query({ client: trx })
            .where('article_id', article_id)
            .where('supplier_id', supplier_id)
            .first()
  
          if (existingStock) {
            // Create new stock entry
            await Stock.create(
              {
                supplier_id,
                article_id,
                user_id,
                quantite,
                prix_unitaire,
                prix_total,
                avance_credit,
                transaction_type,
                status: this.getStockStatus(quantite),
              },
              { client: trx }
            )
          
          // Create stock movement
          await StockMovement.create(
            {
              user_id,
              article_id,
              stock_id: existingStock.id,
              supplier_id,
              unit_price:prix_unitaire,
              ancien_prix:existingArticle?.prix_unitaire || prix_unitaire,
              nouveau_prix:prix_unitaire,
              quantite: quantite,
              type: quantite > 0 ? 'entree' : (existingArticle ? 'modification': 'sortie'),
              description: `${quantite > 0 ? '+' : ''}${quantite} ${
                quantite > 0 ? 'entrée' : 'sortie'
              } sur ${existingStock.quantite} (quantité existante)`,
            },
            { client: trx }
          )
        }

        } else {
          // Create new stock entry
          const stock = await Stock.create(
            {
              supplier_id,
              article_id,
              user_id,
              quantite,
              prix_unitaire,
              prix_total,
              avance_credit,
              transaction_type,
              status: this.getStockStatus(quantite),
            },
            { client: trx }
          )
  
          // Create stock movement
          await StockMovement.create(
            {
              user_id,
              article_id,
              stock_id: stock.id,
              supplier_id,
              quantite,
              type: 'entree',
              description: `+${quantite} entrée (nouvel article)`,
            },
            { client: trx }
          )
  
          // Save price history
          await PriceHistory.create(
            {
              article_id,
              prix_unitaire,
              quantite,
              date: DateTime.now(),
              description: `Prix initial`,
            },
            { client: trx }
          )
        }
  

        // Track payment if transaction is cash or credit 
        if (transaction_type === 'cash') {
          supplierPayments[supplier_id] = (supplierPayments[supplier_id] || 0) + prix_total
        } else if (transaction_type === 'credit') {
          supplierPayments[supplier_id] =
            (supplierPayments[supplier_id] || 0) +
            prix_total -
            Number((prix_unitaire * quantite * avance_credit) / 100);
        }
      }
  
      // Create payment histories for cash transactions
      console.log(user_id)
      for (const [supplierId, amount] of Object.entries(supplierPayments)) {
        await PaymentHistory.create(
          {
            supplier_id: Number(supplierId),
            amount,
            payment_date: DateTime.now(),
            payment_method: 'cash',
            description: `Paiement pour approvisionnement de stock`,
          },
          { client: trx }
        )
      }
  
      await trx.commit()
      return response.status(201).json({ message: 'Stock mis à jour avec succès' })
    } catch (error) {
      await trx.rollback()
      return response.status(500).json({ error: error.message })
    }
  }

  /**
   * Show individual record
   */
  // async show({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  // async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  // async destroy({ params }: HttpContext) {}
}