import Budget from '#models/budget'
import type { HttpContext } from '@adonisjs/core/http'

export default class BudgetsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const budgets = await Budget.query()
      .preload('enterprise')
      .preload('creator')
      .preload('caisse')
      .orderBy('created_at', 'desc')

    return response.json(budgets || [])
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
  async destroy({ params,response }: HttpContext) {
    const budget = await Budget.find(params.id)
    if (!budget) {
      return response.status(404).json({ message: 'Budget not found' })
    }
    await budget.delete()
    return response.json({ message: 'Budget deleted successfully' })
  }
}