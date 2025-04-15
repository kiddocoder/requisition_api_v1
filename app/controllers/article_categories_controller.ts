
import ArticleCategory from '#models/article_category'
import type { HttpContext } from '@adonisjs/core/http'

export default class ArticleCategoriesController {
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    const articleCategories = await ArticleCategory.query()
    .orderBy('created_at', 'desc')
    return response.json(articleCategories)
  }

 
  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(['name', 'description'])
    const articleCategory = await ArticleCategory.create(data)
    return response.json(articleCategory)
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const articleCategory = await ArticleCategory.findOrFail(params.id)
    return response.json(articleCategory)
  }


  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    const articleCategory = await ArticleCategory.findOrFail(params.id)
    const data = request.only(['name', 'description'])
    await articleCategory.merge(data).save()
    return response.json(articleCategory)
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const articleCategory = await ArticleCategory.findOrFail(params.id)
    await articleCategory.delete()
    return response.json({ message: 'Article category deleted successfully' })
  }

 

}
