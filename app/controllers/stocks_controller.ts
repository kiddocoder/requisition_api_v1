import Article from '#models/article';
import PaymentHistory from '#models/payment_history';
import PriceHistory from '#models/price_history';
import Stock from '#models/stock';
import StockMovement from '#models/stock_movement';
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db';
import { DateTime } from 'luxon';

interface StockItem {
  article_id: number
  quantite: number
  prix_unitaire: number
  prix_total: number
}

interface StockRequest {
  items: StockItem[]
  supplier_id: number
  transaction_type: 'cash' | 'credit'
  avance_credit?: number
  user_id: number
}


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
      const {
        items,
        supplier_id,
        transaction_type,
        avance_credit = 0,
        user_id,
      } = request.all() as StockRequest

      // Process each stock item
      for (const item of items) {
        const { article_id, quantite, prix_unitaire, prix_total } = item

        // Check if article exists in stock
        const existingStock = await Stock.query({ client: trx })
          .where('article_id', article_id)
          .first()

        if (existingStock) {
          // Save old price to price history
          await PriceHistory.create(
            {
              article_id,
              prix_unitaire: existingStock.prix_unitaire,
              quantite: existingStock.quantite,
              date: DateTime.now(),
              description: `Prix avant mise à jour (${existingStock.prix_unitaire} FCFA)`,
            },
            { client: trx }
          )

          // Update existing stock
          const newQuantity = existingStock.quantite + quantite
          await existingStock
            .merge({
              quantite: newQuantity,
              prix_unitaire,
              prix_total: prix_unitaire * newQuantity,
              status: this.getStockStatus(newQuantity),
            })
            .useTransaction(trx)
            .save()

          // Create stock movement
          await StockMovement.create(
            {
              user_id,
              article_id,
              stock_id: existingStock.id,
              supplier_id,
              quantite: quantite,
              type: quantite > 0 ? 'in' : 'out',
              description: `${quantite > 0 ? '+' : ''}${quantite} ${
                quantite > 0 ? 'entrée' : 'sortie'
              } sur ${existingStock.quantite} (quantité existante)`,
            },
            { client: trx }
          )
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
              type: 'in',
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

        // Update article current price
        const article = await Article.findOrFail(article_id, { client: trx })
        article.prix_unitaire = prix_unitaire
        await article.useTransaction(trx).save()
      }

      // Handle payment if transaction is cash
      if (transaction_type === 'cash') {
        const totalAmount = items.reduce((sum, item) => sum + item.prix_total, 0)
        
        await PaymentHistory.create(
          {
            supplier_id,
            amount: totalAmount,
            payment_date: DateTime.now(),
            payment_method: 'cash',
            user_id,
            description: `Paiement pour approvisionnement de stock`,
          },
          { client: trx }
        )
      }

      await trx.commit()
      return response.status(201).json({ message: 'Stock updated successfully' })
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