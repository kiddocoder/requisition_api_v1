import Car from '#models/car';
import CarEquipment from '#models/car_equipment';
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
      'requiredForDriving',
      'description'
    ])

    const equipment = await Equipment.updateOrCreate({name:data.name},{
      name:data.name,
      required_for_driving:data.requiredForDriving || true,
      description:data.description || null
    })
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
      'requiredForDriving',
      'description'
    ])
    await equipment.merge({
      name: data.name,
      required_for_driving: data.requiredForDriving || true,
      description: data.description || null
    }).save()
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
  /**
   * Add equipment to a car
   */
  async addCarEquipments({ params, request,response }: HttpContext) {
    const car_id = params.id
    const car = await Car.findOrFail(car_id);
    if(!car){
      return response.notFound({ message: 'Car not found' })
    }
    const equipments = await request.input('equipments');

    await CarEquipment.createMany(
      equipments.map((equipment: any) => ({
        car_id: car.id,
        equipment_id: equipment.id,
        expiry_date: equipment.expiry_date,
        is_present: equipment.is_present,
      }))
    );
    return response.created({ message: 'Equipments added to car' })
  }
}