import Car from '#models/car'
import CarDocument from '#models/car_document'
import CarEquipment from '#models/car_equipment'
import type { HttpContext } from '@adonisjs/core/http'

export default class CarsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const cars = await Car.query()
    .preload('documents')
    .preload('equipments')
    .orderBy('created_at', 'desc')
    .exec()

    return response.ok(cars || [])
  }



  /**
   * Handle form submission for the create action
   */
  async store({response,request}: HttpContext) {
    const data =  request.only([
      'name',
      'license_plate',
      'model',
      'brand',
      'description',
      'equipments',
      'documents'
    ])

    const car =  await Car.updateOrCreate({name:data.name},data)
    if(data.equipments.length > 0){
      await CarEquipment.updateOrCreateMany(['car_id', 'equipment_id'],data.equipments.map((equipement: any) => ({
        car_id: car.id,
        equipment_id: equipement.id,
        expiry_date: equipement.expiry_date,
        is_present: equipement.is_present
      })))
    }else if(data.documents.length>0){
      await CarDocument.updateOrCreateMany(['car_id', 'document_id'],data.documents.map((document: any) => ({
        car_id: car.id,
        document_id: document.id,
        expiry_date: document.expiry_date,
        is_present: document?.is_present || true
      })))
    }

    return response.created(car)
  }
  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    const car = await Car.find(params.id);
    if(!car){
      return response.notFound({ message: 'Car not found' })
    }
    car.load('documents')
    car.load('equipments')

    return response.send(car)
  }


  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const car = await Car.findOrFail(params.id)
    const data = request.only([
      'name',
      'license_plate',
      'model',
      'brand',
      'description'
    ])

    await car.merge(data).save()
    return car;
  }

  /**
   * Delete record
   */
  async destroy({ params,response }: HttpContext) {
    const car = await Car.findOrFail(params.id);
    await car.delete();
    return response.ok({ message: 'Car deleted' })
  }
 
  /* get car documents */
  async getCarDocuments({ params,response }: HttpContext) {
    const car = await Car.findOrFail(params.id);
    if(!car){
      return response.notFound({ message: 'Car not found' })
    }
    await car.load('documents')
    return response.ok(car.documents)
  }

  /* get car equipments */
  async getCarEquipments({ params,response }: HttpContext) {
    const car = await Car.findOrFail(params.id);
    if(!car){
      return response.notFound({ message: 'Car not found' })
    }
    await car.load('equipments')
    return response.ok(car.equipments)
  }

}