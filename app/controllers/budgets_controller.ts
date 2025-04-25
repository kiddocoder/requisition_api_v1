import Budget from '#models/budget'
import type { HttpContext } from '@adonisjs/core/http'

export default class BudgetsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const budgets = await Budget.query()
    .preload('caisse')
    .preload('creator')
    .preload('enterprise')
    .orderBy('created_at','desc')
    .exec();

    return response.send(budgets || [])
  }

  /**
   * Handle form submission for the create action
   */
  // async store({ request }: HttpContext) {}

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