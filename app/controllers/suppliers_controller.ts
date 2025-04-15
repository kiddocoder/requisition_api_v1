import Supplier from "#models/supplier"
import { HttpContext } from "@adonisjs/core/http"

export default class SuppliersController {
  /**
   * Display a list of resource
   */
  public async index({ response }: HttpContext) {
    const suppliers = await Supplier.query().where('is_deleted',false).orderBy('created_at','desc').exec() || []
    return response.json(suppliers)
  }

  /**
   * Handle form submission for the create action
   */
  public async store({ request, response }: HttpContext) {
    const data = request.only(['name', 'address', 'phone'])
    const supplier = await Supplier.updateOrCreate({ name: data.name }, data)
    return response.json(supplier)
  }

  /**
   * Show individual record
   */
  public async show({ params, response }: HttpContext) {
    const supplier = await Supplier.findOrFail(params.id)
    return response.json(supplier)
  }

  /**
   * Handle form submission for the edit action
   */
  public async update({ params, request, response }: HttpContext) {
    const supplier = await Supplier.findOrFail(params.id)
    await supplier.merge(request.all()).save()
    return response.json(supplier)
  }

  /**
   * Delete record
   */
  public async destroy({ params, response }: HttpContext) {
    const supplier = await Supplier.findOrFail(params.id);
    supplier.is_deleted = true;
    await supplier.save()
    return response.json({ message: 'Supplier deleted' })
  }
}
