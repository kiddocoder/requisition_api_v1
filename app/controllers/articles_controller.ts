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
      'unite_mesure',
      'reference'
    ]);

    const generatedRef = String(data.name).slice(0,4).toUpperCase()+'-'+Math.floor(Math.random() * 10000);
    if(!data.reference) {
      data.reference = generatedRef;
    }

    const article = await Article.updateOrCreate({name:data.name},data)
    if(article.quantite_restante = 0){
      article.status = 'rupture_de_stock'
    }
    return response.json(article)
  }

  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    const article = await Article.find(params.id)
    if(!article || article.is_deleted){
      return response.notFound({message:"Article not found"})
    }
    article.load('category');

    return response.json(article)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params,response,request }: HttpContext) {
    const data = request.only([
      'name',
      'description',
      'category_id',
      'unite_mesure',
      'reference'
    ]);
  
    const article = await Article.find(params.id)
    if(!article || article.is_deleted){
      return response.notFound({message:"Article not found"})
    }

    const generatedRef = String(data.name).slice(0,4).toUpperCase()+'-'+Math.floor(Math.random() * 10000);
    if(!data.reference) {
      data.reference = generatedRef;
    }
    
    article.merge(data)
    await article.save()
    return response.json(article)


  }

  /**
   * Delete record
  */ 
   async destroy({ params,response }: HttpContext) {
    const article = await Article.find(params.id)
    if(!article || article.is_deleted){
      return {message:"Article not found"}
    }
    article.is_deleted = true;
    await article.save()
    return response.json({message:"Article deleted successfully"})
   }

  
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