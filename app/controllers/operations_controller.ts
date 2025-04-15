import Operation from '#models/operation'
import type { HttpContext } from '@adonisjs/core/http'

export default class OperationsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const operations =  await Operation.query()
    .preload('caisse')
    .preload('operation_type')
    .preload('user')
    .orderBy('created_at','desc')

    response.send(operations || [])
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