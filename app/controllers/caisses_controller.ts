import Caisse from '#models/caisse'
import type { HttpContext } from '@adonisjs/core/http'

export default class CaissesController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const caisses =  await Caisse.all();
    return response.send(caisses || [])
  }


  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const data = request.only([
      'name',
      'budget'
    ])
    const caisse =  await Caisse.updateOrCreate({name:data.name},data);
    return response.send(caisse)
  } 
  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    const caisse = await Caisse.find(params.id);
    return response.send(caisse || {message:"Not casse found !"})
  }

  /**
   * Handle form submission for the edit action 
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}