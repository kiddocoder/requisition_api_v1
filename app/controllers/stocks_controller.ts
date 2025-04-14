import Stock from '#models/stock';
import type { HttpContext } from '@adonisjs/core/http'

export default class StocksController {
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
  // async store({ request,response }: HttpContext) {

  // }

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