import Document from '#models/document';
import type { HttpContext } from '@adonisjs/core/http'

export default class DocumentController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const Documents = await Document.query()
    .preload('cars')
    .orderBy('created_at', 'desc')
    .exec();

    return response.send(Documents || [])
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const data = request.only([
      'name',
      'description'
    ])

    const document = await Document.updateOrCreate({name:data.name},data)
    return response.send(document)
  }

  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    const document = await Document.find(params.id);
   if(!document){
    return response.send({message:"Document not found"})
   }
    return response.send(document)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request,response }: HttpContext) {
    const document = await Document.findOrFail(params.id)
    const data = request.only([
      'name',
      'description'
    ])
    await document.merge(data).save()
    return response.send(document)
  }

  /**
   * Delete record
   */
  async destroy({ params,response }: HttpContext) {
    const document = await Document.findOrFail(params.id);
    await document.delete();
    return response.ok({ message: 'Document deleted' })
  }
}