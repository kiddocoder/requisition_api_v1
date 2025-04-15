import Notification from '#models/notification'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotificationsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const notifications = await Notification.query()
    .orderBy('created_at','desc')
    return response.send(notifications || [])
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