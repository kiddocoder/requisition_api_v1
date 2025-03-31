import Article from '#models/article';
import Requisition from '#models/requisition';
import RequisitionAttachment from '#models/requisition_attachment';
import RequisitionComment from '#models/requisition_comment';
import RequisitionItem from '#models/requisition_item';
import env from '#start/env';
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app';
import { DateTime } from 'luxon';
import path from 'path';
import fs from 'fs/promises'

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
          query.preload('supplier')
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

       items.map(async (item:any)=>{
       const k =  await Article.find(item.article_id)
        k?.merge({
          unite_mesure:item.uniteMesure
        })
        k?.save()
       })
      
        // Ajout des nouveaux articles dans la table RequisitionItem
        const newRequisitionItems = items.map((item:any) => ({
          requisition_id: requisition.id,
          article_id: item.article_id,
          quantite_demande: Number(item.quantiteDemande || 0)
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
      query.preload('supplier')
    })
    .preload('comments')
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
      const requisition_id = Number(request.input('requisition_id'));
      const priority = request.input('priority') || 'normal';
      const comment = request.input('comment') || null;
      const user_id = request.input('user_id') || null;
      const items = request.input('items') || [];
      const pieceFiles = request.files('attachments', {
        size: '10mb',
        extnames: ['jpg', 'png', 'pdf', 'docx', 'xlsx'],
      });
  
      // Vérifier si la réquisition existe et n'est pas supprimée
      const requisition = await Requisition.find(requisition_id);
      if (!requisition || requisition.is_deleted) {
        return response.notFound({ message: 'Requisition not found or deleted!' });
      }
  
      // Mise à jour de la priorité de la réquisition
      requisition.priority = priority;
      await requisition.save();

      let requisitionItems:Partial<RequisitionItem>[] = items.map((item:RequisitionItem) => ({
        requisition_id: Number(requisition.id),
        article_id: Number(item.article_id),
        prix_unitaire: Number(item.prix_unitaire),
        prix_total: Number(item.prix_total),
        transaction_type: item.transaction_type,
        avance_credit: Number(item.avance_credit),
        supplier_id: Number(item.supplier_id)
      }));

      // requisition.items.map((reqItem)=>{
      //   const item = requisitionItems.
      // })

      console.log(requisitionItems)
      await RequisitionItem.updateOrCreateMany(['article_id','requisition_id'],requisitionItems)

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
          // Déplacer le fichier vers le dossier de stockage
          await file.move(app.tmpPath('requisition_attachments'), {
            name: `${new Date().getTime()}_${file.clientName}`,
            overwrite: true
          });
  
          await RequisitionAttachment.create({
            requisition_id,
            file_name: `${file.fileName}`,
            file_type: file.type,
            url: `${env.get('API_URL')}attachments/${file.fileName}`
          });
        }
      }
  
      return response.ok({ message: 'Requisition updated successfully!' });
    } catch (error) {
      return response.badRequest({ message: error.message });
    }
  }

  async serveAttachment({ params, response }: HttpContext) {
    try {
      const { filename } = params;
      const storagePath = app.tmpPath('requisition_attachments');
      const filePath = path.join(storagePath, filename);
  
      // Check if file exists
      await fs.access(filePath);
  
      // Optional: Verify the file exists in your database
      const attachmentRecord = await RequisitionAttachment.findBy('file_nmae', `${filename}`);
      
      if (!attachmentRecord) {
        return response.notFound({ message: 'File record not found' });
      }
  
      // Set appropriate headers
      response.header('Content-Disposition', `inline; filename="${filename}"`);

      // Stream the file
      return response.download(filePath);
  
    } catch (error) {
      if (error.code === 'ENOENT') {
        return response.notFound({ message: 'File not found' });
      }
      
      console.error('File serving error:', error);
      return response.internalServerError({ message: 'Failed to serve file' });
    }
  }

  async requisitionComments({response,params}:HttpContext){
    const requisition = await Requisition.find(params.requisition_id)
    if(!requisition){
      return response.notFound({message:"Requisition not found"})
    }

    const comments = await Requisition.query()
    .preload('comments',(query)=>{
      query.orderBy('created_at','asc')
    })
    .select('comments')
    .orderBy('created_at','asc')
    .exec();

    return response.send(comments || [])
  }
  
}