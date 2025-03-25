import Article from '#models/article';
import Requisition from '#models/requisition';
import RequisitionItem from '#models/requisition_item';
import type { HttpContext } from '@adonisjs/core/http'

export default class RequisitionsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    try {
      const requisitions = await Requisition.query()
      .where('is_deleted',false)
      .preload('enterprise')
      .preload('items')
      .preload('demendeur')
       || [];
       

      return response.send(requisitions)
    
    } catch (error) {
      return response.internalServerError(error)
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const items:Partial<RequisitionItem>[] = request.input('items');
    const data = request.only([
      'objet',
      'titre',
      'date',
      'demendeur_id',
      'enterprise_id',
    ]);

    const newItems: Partial<Article>[] = request.input('newItems');

    if(newItems){
      // create them in article and access to requisition_items
      const createdArticles = await Article.updateOrCreateMany(['name'],newItems);
      // add their id to items
      items.forEach((item,i)=>{
        if(createdArticles[i]) item.article_id = createdArticles[i].id;
      })
    }

    // save them to requisition_item
    await RequisitionItem.createMany(items);

    // save requisition (data)
    const requisition = await Requisition.create(data);

    return response.send(requisition);
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}