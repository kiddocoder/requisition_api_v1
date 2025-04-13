import Car from '#models/car'
import type { HttpContext } from '@adonisjs/core/http'

export default class CarsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const cars = await Car.all();

    return response.ok(cars || [])
  }



  /**
   * Handle form submission for the create action
   */
  async store({response,request}: HttpContext) {
    const data =  request.only([
      'name',
      'description'
    ])

    const car =  await Car.updateOrCreate({name:data.name},data)
    return response.created(car)
  }
  /**
   * Show individual record
   */
  // async show({ params }: HttpContext) {}


  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const car = await Car.findOrFail(params.id)
    const data = request.only([
      'name',
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
}