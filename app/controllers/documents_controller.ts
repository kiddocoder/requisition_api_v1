import Car from '#models/car';
import CarDocument from '#models/car_document';
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
      'requiredForDriving',
      'description'
    ])

    const document = await Document.updateOrCreate({name:data.name},{
      name:data.name,
      required_for_driving:data.requiredForDriving || true,
      description:data.description || null
    })
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
      'requiredForDriving',
      'description'
    ])
    await document.merge({
      name: data.name,
      required_for_driving: data.requiredForDriving || true,
      description: data.description || null
    }).save()
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


  /** add car document */
  async addCarDocuments({ params,response ,request}: HttpContext) {
    const car = await Car.findOrFail(params.id);
    if(!car){
      return response.notFound({ message: 'Car not found' })
    }
    const documents = await request.input('documents')
    if(!documents){
      return response.badRequest({ message: 'Documents not found' })
    }
    // check if documents exist
    const documentIds = documents.map((doc: { id: number }) => doc.id)
    const existingDocuments = await Document.query().whereIn('id', documentIds).exec()
    if (existingDocuments.length !== documentIds.length) {
      return response.badRequest({ message: 'Some documents do not exist' })
    }
    await CarDocument.createMany(
      documents.map((doc:any) => ({
        car_id: car.id,
        document_id: doc.id,
        expiry_date: doc.expiry_date,
        is_present: doc.is_present
      }))
    )
   
    return response.ok({ message: 'Documents added to car successfully' })
  }
}