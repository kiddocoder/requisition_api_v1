import Enterprise from '#models/enterprise'
import type { HttpContext } from '@adonisjs/core/http'

export default class EnterprisesController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    return response.json(
      await Enterprise.all()
    )
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const enterprise = await Enterprise.updateOrCreate({name:request.input('name')},request.all())
    return response.json(enterprise)
  }

  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    return response.json(
      await Enterprise.find(params.id) || {message:"Enterprise not found" }
    )
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request,response }: HttpContext) {
    const enterprise = await Enterprise.find(params.id) 
    if(!enterprise) return response.notFound("Enterprise not found");
    enterprise.merge(request.all())
    await enterprise.save()
    return response.json({message:"Enterprise updated successfully",enterprise});
  }

  /**
   * Delete record
   */
  async destroy({ params,response }: HttpContext) {
    const enterprise = await Enterprise.find(params.id)
    if(!enterprise) return response.notFound({message:"Not Enterprise found"})

      enterprise.is_deleted = true;
      await enterprise.save()
      return response.json({message:"Enterprise deleted successfully",enterprise})
  }
}