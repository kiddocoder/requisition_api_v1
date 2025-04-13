import Equipment from '#models/equipment'
import type { HttpContext } from '@adonisjs/core/http'

export default class EquipmentController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const equipments = await Equipment.query()
    .preload('cars')
    .orderBy('created_at', 'desc')
    .exec();

    return response.send(equipments || [])
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const data = request.only([
      'name',
      'description'
    ])

    const equipment = await Equipment.updateOrCreate({name:data.name},data)
    return response.send(equipment)
  }

  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    const equipment = await Equipment.find(params.id);
   if(!equipment){
    return response.send({message:"Equipment not found"})
   }
    return response.send(equipment)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request,response }: HttpContext) {
    const equipment = await Equipment.findOrFail(params.id)
    const data = request.only([
      'name',
      'description'
    ])
    await equipment.merge(data).save()
    return response.send(equipment)
  }

  /**
   * Delete record
   */
  async destroy({ params,response }: HttpContext) {
    const equipment = await Equipment.findOrFail(params.id);
    await equipment.delete();
    return response.ok({ message: 'Equipment deleted' })
  }
}