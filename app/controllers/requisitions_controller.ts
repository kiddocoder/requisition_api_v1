import Article from '#models/article';
import Requisition from '#models/requisition';
import RequisitionItem from '#models/requisition_item';
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon';

export default class RequisitionsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
      const requisitions = await Requisition.query()
      .where('is_deleted',false)
      .preload('enterprise')
      .preload('items')
      .preload('demendeur')
       || [];


      return response.send(requisitions)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    try {
      const createdArticles: Article[] = [];
      const items: Partial<RequisitionItem>[] = request.input('items') || [];
      const data = request.only(['objet', 'titre', 'demendeur_id', 'enterprise_id']);
      const date = DateTime.fromISO(request.input('date'));
  
      // Get new items and insert them into the articles table
      const newItems: Partial<Article>[] = request.input('newItems') || [];
  
      if (newItems.length > 0) {
        // Create new articles and store their references
        const insertedArticles = await Article.updateOrCreateMany(['name'], newItems);
        createdArticles.push(...insertedArticles);
  
        // Map newly inserted articles to items array
        insertedArticles.forEach((article) => {
          items.push({ article_id: article.id });
        });
      }
  
      // Save requisition
      const requisition = await Requisition.create({ ...data, date });
  
      // Assign requisition_id to all items before inserting into RequisitionItem
      items.forEach((item) => {
        item.requisition_id = requisition.id;
      });
  
      // Insert items into requisition_items table
      if (items.length > 0) {
        await RequisitionItem.createMany(items);
      }
  
      return response.send(requisition);
    } catch (error) {
      return response.badRequest(error.message);
    }
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