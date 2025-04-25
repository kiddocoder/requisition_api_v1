import Department from '#models/department'
import type { HttpContext } from '@adonisjs/core/http'

export default class DepartmentsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const departments = await Department.query()
      .preload('enterprise')
      .preload('creator')
      .preload('manager')
      .orderBy('created_at', 'desc')

    return response.json(departments || [])
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request ,response}: HttpContext) {
    const data  =  request.only([
      'name',
      'description',
      'enterprise_id',
      'creator_id',
      'manager_id',
      'employee_count'
    ])
    const department = await Department.create({
      name: data.name,
      description: data.description,
      enterprise_id: data.enterprise_id,
      created_by: data.creator_id,
      manager_id: data.manager_id,
      employee_count: data.employee_count
    })

    return response.json(department)
  }

  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    const department = await Department.find(params.id)
    if (!department) {
      return response.status(404).json({ message: 'Department not found' })
    }
    return response.json(department)
  }


  /**
   * Handle form submission for the edit action
   */
  async update({ params, request,response }: HttpContext) {
    const department = await Department.find(params.id)
    if (!department) {
      return response.status(404).json({ message: 'Department not found' })
    }

    const data = request.only([
      'name',
      'description',
      'enterprise_id',
      'creator_id',
      'manager_id',
      'employee_count'
    ])

    department.merge(data)
    await department.save()

    return response.json(department)
  }

  /**
   * Delete record
   */
  async destroy({ params,response }: HttpContext) {
    const department = await Department.find(params.id)
    if (!department) {
      return response.status(404).json({ message: 'Department not found' })
    }

    await department.delete()

    return response.json({ message: 'Department deleted successfully' })
  }
}