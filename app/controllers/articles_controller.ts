import Article from '#models/article'
import type { HttpContext } from '@adonisjs/core/http'

export default class ArticlesController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const articles = await Article.query().where('is_deleted',false) || [];
    return response.send(articles)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const data = request.all();
    const article = await Article.updateOrCreate({name:data.name},data)
    return response.json(article)
  }

  /**
   * Show individual record
   */
  // async show({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  // async update({ params, request }: HttpContext) {}

  /**
   * Delete record
  */ 
  //  async destroy({ params }: HttpContext) {}
}