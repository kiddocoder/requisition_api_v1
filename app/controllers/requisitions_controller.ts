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
import Caisse from '#models/caisse';
import Operation from '#models/operation';
import OperationType from '#models/operation_type';
import db from '@adonisjs/lucid/services/db';
import logger from '@adonisjs/core/services/logger';

export default class RequisitionsController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const requisitions = await Requisition.query()
    .where('is_deleted', false)
    .preload('enterprise')
    .preload('items', (query) => {
      query.preload('article')
      query.preload('supplier')
    })
    .preload('attachments')
    .preload('demendeur')
    .orderBy('created_at', 'desc')

      return response.send(requisitions)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const trx = await db.transaction(); 

  
    try {
      // 1. Récupération et validation des données
      const data = request.only(['objet', 'titre', 'demendeur_id', 'enterprise_id']);
      const comment = request.input('comment');
      const date = DateTime.fromISO(request.input('date'));
      const items = request.input('items') || [];
  
      if (!items.length) {
        await trx.rollback();
        return response.badRequest({ message: 'Au moins un article est requis' });
      }
  
      // 2. Création de la requête principale
      const requisition = await Requisition.create({ 
        ...data, 
        date,
        status: 'pending'
      }, { client: trx });

      console.log(items)
  
      // 3. Traitement des articles
      await Promise.all(items.map(async (item: any) => {
        // Mise à jour de l'unité de mesure si fournie
        if (item.uniteMesure) {
          await Article.query({client:trx})
            .where('id', item.article_id)
            .update({ 'unite_mesure': item.uniteMesure });
        }
  
        // Création des items de la requête
        await RequisitionItem.create({
          requisition_id: requisition.id,
          article_id: item.article_id,
          quantite_demande: Number(item.quantiteDemande) || 0,
          prix_unitaire: Number(item.prix_unitaire) || 0,
          prix_total: Number(item.prix_total) || 0,
          supplier_id: item.supplier_id || null,
          transaction_type: item.transaction_type || null,
          avance_credit: Number(item.avance_credit) || 0
        }, { client: trx })
    
      }));

     
  
      // 4. Enregistrement du commentaire si présent
      if (comment) {
        await RequisitionComment.create({
          comment,
          requisition_id: requisition.id,
          user_id: data.demendeur_id
        }, { client: trx });
      }
  
      await trx.commit(); // Validation de la transaction
      return response.created(requisition);
  
    } catch (error) {
      await trx.rollback();
      logger.error(error);
      return response.status(500).json({ 
        message: 'Erreur lors de la création de la requête',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    const requisition = await Requisition.query()
    .where('id',params.id)
    .preload('enterprise')
    .preload('items', (query) => {
      query.where('requisition_id',params.id)
      query.preload('article')
      query.preload('supplier')
    })
    .preload('attachments')
    .preload('demendeur')
    .orderBy('created_at', 'desc')
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
  async update({ params, request,response }: HttpContext) {
    const trx = await db.transaction();
    try {
      const data = request.only(['objet', 'titre', 'demendeur_id', 'enterprise_id']);
      const comment = request.input('comment');
      const date = DateTime.fromISO(request.input('date'));
      const items = request.input('items') || [];
  
      if (!items.length) {
        await trx.rollback();
        return response.badRequest({ message: 'Au moins un article est requis' });
      }
  
      // 2. Mise à jour de la requête principale
      const requisition = await Requisition.query({ client: trx })
        .where('id', params.id)
        .update({
          ...data,
          date,
          status: 'pending'
        });
  
      // 3. Traitement des articles

             // Remove all articles from this requisition that were not selected
      await RequisitionItem.query({ client: trx })
        .where('requisition_id', params.id)
        .whereNotIn('article_id', items.map((item: any) => item.article_id))
        .delete();

       await Promise.all(items.map(async (item: any) => {
        // Mise à jour de l'unité de mesure si fournie
        if (item.uniteMesure) {
          await Article.query({client:trx})
            .where('id', item.article_id)
            .update({ 'unite_mesure': item.uniteMesure });
        }
  
        // Mise à jour des items de la requête
        await RequisitionItem
          .updateOrCreate({
            requisition_id: params.id,
            article_id: item.article_id
          },{
            quantite_demande: Number(item.quantiteDemande) || 0,
            prix_unitaire: Number(item.prix_unitaire) || 0,
            prix_total: Number(item.prix_total) || 0,
            supplier_id: item.supplier_id || null,
            transaction_type: item.transaction_type || null,
            avance_credit: Number(item.avance_credit) || 0
          },{client:trx});
      }));
  
      // 4. Enregistrement du commentaire si présent
      if (comment) {
        await RequisitionComment.updateOrCreate({
          requisition_id: params.id,
          user_id: data.demendeur_id
        },
          {
          comment,
          requisition_id: params.id,
          user_id: data.demendeur_id
        }, { client: trx });
      }
  
      await trx.commit(); // Validation de la transaction
      return response.ok(requisition);
    } catch (error) {
      await trx.rollback();
      logger.error(error);
      return response.status(500).json({
        message: 'Erreur lors de la mise à jour de la requête',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }

  /**
   * Delete record
   */
  // async destroy({ params }: HttpContext) {}

  async approvisionnement({ response, request }: HttpContext) {
    const trx = await db.transaction();
  
    try {
      const requisition_id = Number(request.input('requisition_id'));
      const priority = request.input('priority') || 'normal';
      const comment = request.input('comment') || null;
      const user_id = request.input('user_id') || null;
      const items = request.input('items') || [];
      const author = request.input('author') || 'utilisateur'
      const pieceFiles = request.files('attachments', {
        size: '10mb',
        extnames: ['jpg', 'png', 'pdf', 'docx', 'xlsx'],
      });
  
      // Vérifier si la réquisition existe et n'est pas supprimée
      const requisition = await Requisition.query({ client: trx }).where('id', requisition_id).where('is_deleted', false).first();
      if (!requisition) {
        await trx.rollback();
        return response.notFound({ message: 'Requisition not found or deleted!' });
      }
  
      // Mise à jour de la priorité de la réquisition
      requisition.priority = priority;
      requisition.precured = true; 
      await requisition.useTransaction(trx).save();
  
      // 1. D'abord, supprimer les articles qui ne sont plus dans la liste
      const currentArticleIds = items.map((item: any) => Number(item.article_id));
      await RequisitionItem.query({ client: trx })
        .where('requisition_id', requisition.id)
        .whereNotIn('article_id', currentArticleIds)
        .delete();
  
      // 2. Ensuite, mettre à jour ou créer les articles
      for (const item of items) {
        await RequisitionItem.updateOrCreate(
          {
            requisition_id: requisition.id,
            article_id: item.article_id
          },
          {
            requisition_id: requisition.id,
            article_id: item.article_id,
            prix_unitaire: Number(item.prix_unitaire),
            prix_total: Number(item.prix_total),
            transaction_type: item.transaction_type,
            avance_credit: Number(item.avance_credit),
            supplier_id: item.supplier_id,
            quantite_demande: Number(item.quantite_demande)
          },
          { client: trx }
        );
      }
  
      // Ajouter un commentaire si fourni
      if (comment) {
        await RequisitionComment.create({
          requisition_id,
          comment,
          author,
          user_id
        }, { client: trx });
      }
  
      // Traitement des pièces jointes
      if (pieceFiles && pieceFiles.length > 0) {
        for (const file of pieceFiles) {
          await file.move(app.tmpPath('requisition_attachments'), {
            name: `${new Date().getTime()}`,
            overwrite: true
          });
  
          if (!file.markAsMoved) {
            throw new Error(`Failed to move file: ${file.errors[0].message}`);
          }
  
          await RequisitionAttachment.create({
            requisition_id,
            file_name: file.fileName,
            file_type: file.type,
            url: `${env.get('API_URL')}attachments/${file.fileName}`
          }, { client: trx });
        }
      }
  
      await trx.commit();
      return response.ok({ 
        message: 'Requisition updated successfully!',
        requisition_id: requisition.id
      });
    } catch (error) {
      await trx.rollback();
      console.error('Approvisionnement error:', error);
      return response.badRequest({ 
        message: 'Failed to update requisition',
        error: process.env.NODE_ENV === 'development' ? error.message : null
      });
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
      const attachmentRecord = await RequisitionAttachment.findBy('file_name', `${filename}`);
      
      if (!attachmentRecord) {
        return response.notFound({ message: 'File record not found' });
      }
  
      // Set appropriate headers
      response.header('Content-Disposition', `inline; filename="${filename}"`);

      // Stream the file
      return response.download(filePath);
  
    } catch (error) {
      if (error.code === 'ENOENT') {
        return response.notFound({ message: 'File not found'});
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

  async ApproveCompta({request,params,response}:HttpContext){
    const data = request.only([
      'requisition_id',
      'caisse_id',
      'voiture_id',
      'description',
    ]) 

    const getcomment = request.input('comment');
    const {comment,author,user_id} = getcomment;
    const total = Number(request.input('total'));

    const requisition = await Requisition.find(params.requisition_id);
    if (!requisition || requisition.is_deleted) {
      return response.notFound({ message: 'Requisition not found or deleted!' });
    }
    requisition.status = 'pending';
    requisition.approved_accounter = true;
    requisition.save();

    const  caisse = await Caisse.find(data.caisse_id)
    if(!caisse || caisse.is_deleted ){
      return response.notFound({ message: 'Caisse not found or deleted!' });
    }
    caisse.merge(
      {
        solde_actuel:caisse.budget - total
      }
    )
    caisse.save();

    const operation = await OperationType.findByOrFail({name:'expenses'})

    await Operation.create({
      operation_type_id:operation.id,
      caisse_id:caisse.id,
      amount:total,
      user_id:user_id,
      description:data?.description || null
    })

      // Ajouter un commentaire si fourni
      if (comment) {
        await RequisitionComment.create({
          requisition_id:data.requisition_id,
          comment,
          user_id,
          author
        });
      }

      response.ok({message:"Approved par compatabit"})
  
  }

  async requisition_articles({response,params}:HttpContext){
    const requisition = await Requisition.find(params.requisition_id);
    const articles = await requisition?.related('items').query();
    return response.send(articles || [])
  }

  async approvDirection({response,params,request}:HttpContext){
    const requisition = await Requisition.find(params.requisition_id);
    const status = request.input('status') || 'pending'
    if(!requisition){
      return response.notFound({message:"Requisition not found!"})
    }
    requisition.approved_direction = status === 'approved';
    requisition.status = status;
    requisition.save()
    return response.ok({message:"Requisition approuv directio"})
  }

  async getRequisitionByDemandeur({response,params}:HttpContext){
    const requisitions = await Requisition.query()
    .where('demendeur_id',params.id)
    .preload('enterprise')
    .preload('items', (query) => {
      query.preload('article')
      query.preload('supplier')
    })
    .preload('attachments')
    .preload('demendeur')
    .orderBy('created_at', 'desc')
    return response.send(requisitions || [])
  }

  async getRequisitionByEnterprise({response,params}:HttpContext){
    const requisitions = await Requisition.query()
    .where('enterprise_id',params.id)
    .preload('enterprise')
    .preload('items', (query) => {
      query.preload('article')
      query.preload('supplier')
    })
    .preload('attachments')
    .preload('demendeur')
    .orderBy('created_at', 'desc')
    return response.send(requisitions || [])
  }
  
}