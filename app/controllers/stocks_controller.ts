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
  
        // Check if article exists in stock for this supplier
        const existingStock = await Stock.query({ client: trx })
          .where('article_id', article_id)
          .where('supplier_id', supplier_id)
          .orderBy('created_at', 'desc')
          .first()
  
        if (existingStock) {
          // Save old price to price history
          await PriceHistory.create(
            {
              article_id,
              prix_unitaire: existingStock.prix_unitaire,
              quantite: existingStock.quantite,
              date: DateTime.now(),
              description: `Prix avant mise à jour (${existingStock.prix_unitaire} BIF)`,
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
              transaction_type,
              avance_credit,
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
  
                // Update article current price and total quantity across all suppliers
        const article = await Article.findOrFail(article_id, { client: trx })

        // Calculate new total quantity by summing all stock entries for this article
        const stocks = await Stock.query({ client: trx })
          .where('article_id', article_id)
          .orderBy('created_at', 'desc')
          .exec()

        const totalQuantityResults = stocks.map(stock => stock.quantite)
        const totalQuantity = totalQuantityResults.reduce((acc, k) => acc + k, 0)

        const newTotalQuantity = totalQuantity || 0

        article.merge({
          prix_unitaire: prix_unitaire, // Update to latest price
          quantite: newTotalQuantity,   // Update to sum of all stock quantities
          status: this.getStockStatus(newTotalQuantity) // Update status based on total
        })

        await article.useTransaction(trx).save()

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
      for (const [supplierId, amount] of Object.entries(supplierPayments)) {
        await PaymentHistory.create(
          {
            supplier_id: Number(supplierId),
            amount,
            payment_date: DateTime.now(),
            payment_method: 'cash',
            user_id,
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