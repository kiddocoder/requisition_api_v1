import StockMovement from '#models/stock_movement'
import type { HttpContext } from '@adonisjs/core/http'

export default class StockMouvementsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const movements = await StockMovement.query()
    .where('is_deleted',false)
    .preload('article')
    .preload('user')
    .preload('stock')
    .preload('supplier')
    .orderBy('createdAt')

    return response.send(movements || [])
  }


  /**
   * Handle form submission for the create action
   */
  // async store({ request }: HttpContext) {}

  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
     const movement = await StockMovement.query()
    .where('is_deleted',false)
    .andWhere('id',params.id)
    .preload('article')
    .preload('user')
    .preload('stock')
    .preload('supplier')
    .orderBy('createdAt')
    .first();

    if(!movement) {
      return response.notFound({message:"Mouvement not found !"})
    }

    return response.send(movement || [])
  }

  /**
   * Edit individual record
  //  */
  // async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  // async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params,response }: HttpContext) {
     const movement = await StockMovement.query()
    .where('is_deleted',false)
    .andWhere('id',params.id)
    .preload('article')
    .preload('user')
    .preload('stock')
    .preload('supplier')
    .orderBy('createdAt')
    .first();

    if(!movement) {
      return response.notFound({message:"Mouvement not found !"})
    }

    movement.is_deleted = true;
    await movement.save();

    return response.ok({message:"Mouvment deleted successfully "})

  }

  async getArticleStockMovment({params,response}:HttpContext){
      const movements = await StockMovement.query()
    .where('is_deleted',false)
    .andWhere('article_id',params.id)
    .preload('article')
    .preload('user')
    .preload('stock')
    .preload('supplier')
    .orderBy('createdAt')
    

    return response.ok(movements || [])
  }
  
}