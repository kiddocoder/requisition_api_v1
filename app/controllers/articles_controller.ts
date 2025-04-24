import Article from '#models/article'
import ArticleCategory from '#models/article_category';
import Stock from '#models/stock';
import Supplier from '#models/supplier';
import type { HttpContext } from '@adonisjs/core/http'

export default class ArticlesController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const articles = await Article.query().where('is_deleted',false)
    .preload('stocks')
    .preload('stockMovements')
    .preload('category')
    .orderBy('created_at','desc').exec() || [];
    return response.send(articles)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const data = request.only([
      'name',
      'description',
      'category_id',
      'reference',
      'unite_mesure'
    ]);
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

  
    async getCategoryArticles({ params, response }: HttpContext) {
      const articleCategory = await ArticleCategory.findOrFail(params.id)

      if(!articleCategory){
        return response.notFound({message:"Article category not found"})
      }

      const articles =  await Article.query()
      .where('category_id',params.id)
       .preload('stocks')
       .preload('category')
      .orderBy('created_at','desc')
   
      
      return response.json(articles)
    }

    async getSupplierArticles({ params, response }: HttpContext) {
      const supplier = await Supplier.findOrFail(params.id)

      if(!supplier){
        return response.notFound({message:"Supplier not found"})
      }
      const articles =  await Stock.query()
      .where('supplier_id',params.id)
      .preload('article')
      .select('article')
      .orderBy('created_at','desc')
      return response.json(articles)
    }
}