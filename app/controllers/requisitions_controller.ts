import Article from '#models/article';
import Requisition from '#models/requisition';
import RequisitionAttachment from '#models/requisition_attachment';
import RequisitionComment from '#models/requisition_comment';
import RequisitionItem from '#models/requisition_item';
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app';
import { DateTime } from 'luxon';

export default class RequisitionsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
      const requisitions = await Requisition.query()
      .where('is_deleted',false)
      .preload('enterprise')
      .preload('items',(query)=>{
        query.preload('article')
      })
      .preload('attachments',(query)=>{
        query.where('is_deleted',false)
      })
      .preload('demendeur')
      .orderBy('created_at','desc')
      .exec()
       || [];

      return response.send(requisitions)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    try {
      // Récupération des données de base
      const data = request.only(['objet', 'titre', 'demendeur_id', 'enterprise_id']);
      const comment = request.input('comment');
      const date = DateTime.fromISO(request.input('date'));
      const items = request.input('items') || [];
      
      // Création de la requête principale
      const requisition = await Requisition.create({ ...data, date });
      
        // Ajout des nouveaux articles dans la table RequisitionItem
        const newRequisitionItems = items.map((item:any) => ({
          requisition_id: requisition.id,
          article_id: item.article_id,
          quantite_demande: parseInt(item.quantiteDemande || 0)
        }));
        
        await RequisitionItem.createMany(newRequisitionItems);
      
      // Enregistrement du commentaire si présent
      if (comment) {
        await RequisitionComment.create({
          comment:comment,
          requisition_id: requisition.id,
          user_id: data.demendeur_id
        });
      }
      
      return response.send(requisition);
    } catch (error) {
      return response.badRequest(error.message);
    }
  }

  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    const requisition = await Requisition.query()
    .where('id',params.id)
    .preload('enterprise')
     .preload('attachments',(query)=>{
      query.where('is_deleted',false)
    })
    .preload('demendeur')
    .preload('items',(query)=>{
      query.preload('article')
    }
    )
    .first();

    if(!requisition){
      return response.notFound({message:'Requisition not found'})
    }

    return response.send(requisition)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}

  async approvisionnement({ response, request }: HttpContext) {
    try {
      const requisition_id = request.input('requisition_id');
      const priority = request.input('priority') || 'normal';
      const comment = request.input('comment') || null;
      const user_id = request.input('user_id') || null;
      const items = request.input('items') || [];
      const pieceFiles = request.files('attachments');
  
      // Vérifier si la réquisition existe et n'est pas supprimée
      const requisition = await Requisition.find(requisition_id);
      if (!requisition || requisition.is_deleted) {
        return response.notFound({ message: 'Requisition not found or deleted!' });
      }
  
      // Mise à jour de la priorité de la réquisition
      requisition.priority = priority;
      await requisition.save();
  
      // Mise à jour des RequisitionItems
      for (const item of items) {
        await RequisitionItem.updateOrCreate(
          { requisition_id, article_id: item.article_id }, // Condition pour mise à jour
          {
            prix_unitaire: parseInt(item.prix_unitaire),
            prix_total: parseInt(item.prix_total),
            transaction_type: item.transaction_type,
            avance_credit: parseInt(item.avance_credit),
            supplier_id: item.supplier_id
          }
        );
      }
  
      // Ajouter un commentaire si fourni
      if (comment) {
        await RequisitionComment.create({
          requisition_id,
          comment,
          user_id
        });
      }
  
      // Traitement des pièces jointes
      if (pieceFiles && pieceFiles.length > 0) {
        for (const file of pieceFiles) {
          const fileName = `${new Date().getTime()}_${file.clientName}`;
          await app.tmpPath('requisition_attachments', { name: fileName });
  
          await RequisitionAttachment.create({
            requisition_id,
            file_path: `requisition_attachments/${fileName}`
          });
        }
      }
  
      return response.ok({ message: 'Requisition updated successfully!' });
    } catch (error) {
      return response.badRequest(error.message);
    }
  }
  
}