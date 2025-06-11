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
import User from '#models/user';
import PriceHistory from '#models/price_history';
import { TransactionClientContract } from '@adonisjs/lucid/types/database';

const traitItems = async (items:RequisitionItem[],requisition:Requisition,trx:TransactionClientContract) => {

  // 1. Valider que tous les articles existent avant de commencer
    const validArticleIds = [];
    for (const item of items) {
      const article_id = Number(item.article_id);
      const articleExists = await Article.query({ client: trx })
        .where('id', article_id)
        .where('is_deleted', false)
        .first();
      
      if (articleExists) {
        validArticleIds.push(article_id);
      } else {
        console.warn(`Article with id ${article_id} not found or deleted, will be skipped`);
        continue;
      }
    }

     // Marquer comme non acceptés les articles qui ne sont plus dans la liste des articles valides
    if (validArticleIds.length > 0) {
      await RequisitionItem.query({ client: trx })
        .where('requisition_id', requisition.id)
        .whereNotIn('article_id', validArticleIds)
        .update({ accepted: false });

    } else {
      // Si aucun article valide n'est fourni, marquer tous comme non acceptés
      await RequisitionItem.query({ client: trx })
        .where('requisition_id', requisition.id)
        .update({ accepted: false });
    }
        // 2. Traiter uniquement les articles valides
    for (const item of items) {
      const article_id = Number(item.article_id);
      
      // Vérifier si cet article est dans la liste des articles valides
      if (!validArticleIds.includes(article_id)) {
        continue; // Ignorer cet article
      }
      
      // Validation des données numériques
      const prix_unitaire = Number(item.prix_unitaire) || 0;
      const avance_credit = Number(item.avance_credit) || 0;
      const quantite_demande = Number(item.quantite_demande) || 0;
      const quantite_recue = Number(item.quantite_recue) || 0;
      const prix_total = Number(item.quantite_recue) *  Number(item.prix_unitaire) || 0;

      console.log(`Processing article_id: ${article_id}, prix_unitaire: ${prix_unitaire}, prix_total: ${prix_total}`);

      // Chercher l'article spécifique pour cette réquisition
      const existingItem = await RequisitionItem.query({ client: trx })
        .where('requisition_id', requisition.id)
        .where('article_id', article_id)
        .first();

      if (existingItem) {
        // Mettre à jour l'article existant
        await RequisitionItem.query({ client: trx })
          .where('id', existingItem.id)
          .update({
            prix_unitaire: prix_unitaire,
            prix_total: prix_total,
            transaction_type: item.transaction_type,
            avance_credit: avance_credit,
            supplier_id: item.supplier_id || null,
            quantite_demande: quantite_demande,
            quantite_recue: quantite_recue,
            accepted: true // Marquer comme accepté puisqu'il est dans la liste
          }); 
        continue;
      }
    }

    return trx;

}

const traitItemsDirection = async (items:RequisitionItem[],requisition:Requisition,trx:TransactionClientContract) => {
    
  // 1. Valider que tous les articles existent avant de commencer
    const validArticleIds = [];
    for (const item of items) {
      const article_id = Number(item.article_id);
      const articleExists = await Article.query({ client: trx })
        .where('id', article_id)
        .where('is_deleted', false)
        .first();
      
      if (articleExists) {
        validArticleIds.push(article_id);
      } else {
        console.warn(`Article with id ${article_id} not found or deleted, will be skipped`);
        continue;
      }
    }

     // Marquer comme non acceptés les articles qui ne sont plus dans la liste des articles valides
    if (validArticleIds.length > 0) {
      await RequisitionItem.query({ client: trx })
        .where('requisition_id', requisition.id)
        .whereNotIn('article_id', validArticleIds)
        .update({ accepted: false });

    } else {
      // Si aucun article valide n'est fourni, marquer tous comme non acceptés
      await RequisitionItem.query({ client: trx })
        .where('requisition_id', requisition.id)
        .update({ accepted: false });
    }
        // 2. Traiter uniquement les articles valides
    for (const item of items) {
      const article_id = Number(item.article_id);
      
      // Vérifier si cet article est dans la liste des articles valides
      if (!validArticleIds.includes(article_id)) {
        continue; // Ignorer cet article
      }
      
      // Validation des données numériques
      const prix_unitaire = Number(item.prix_unitaire) || 0;
      const avance_credit = Number(item.avance_credit) || 0;
      const quantite_demande = Number(item.quantite_demande) || 0;
      const quantite_recue = Number(item.quantite_recue) || 0;
      const prix_total = Number(item.quantite_recue) *  Number(item.prix_unitaire) || 0;

      console.log(`Processing article_id: ${article_id}, prix_unitaire: ${prix_unitaire}, prix_total: ${prix_total}`);

      // Chercher l'article spécifique pour cette réquisition
      const existingItem = await RequisitionItem.query({ client: trx })
        .where('requisition_id', requisition.id)
        .where('article_id', article_id)
        .first();

      if (existingItem) {
        // Mettre à jour l'article existant
        await RequisitionItem.query({ client: trx })
          .where('id', existingItem.id)
          .update({
            prix_unitaire: prix_unitaire,
            prix_total: prix_total,
            transaction_type: item.transaction_type,
            avance_credit: avance_credit,
            supplier_id: item.supplier_id || null,
            quantite_demande: quantite_demande,
            quantite_recue: quantite_recue,
            accepted: true // Marquer comme accepté puisqu'il est dans la liste
          }); 

          // update article ...
          const suchArticle = await Article.findOrFail(existingItem.article_id);

          await Article.query({client:trx})
          .where('id',existingItem.article_id)
          .update({
            quantite_restante: (existingItem.transaction_type === 'stock'&& suchArticle.quantite_restante > 1) ? Number((suchArticle.quantite_restante) -  Number(quantite_recue)) : suchArticle.quantite_restante
          })

          // create price history
          await PriceHistory.create({
            article_id:existingItem.article_id,
            prix_unitaire:prix_unitaire,
            quantite:quantite_recue,
            date:DateTime.now()
          })
        
        console.log(`Updated existing item for article_id: ${article_id}`);
        continue;
      }
    }

    return trx;

}
 

export default class RequisitionsController {
  /**
   * Display a list of resource
   */
  async index({response,request}: HttpContext) {

    const userPost = request.input('post');

    let status = 'pending';
    let next_step = 'approvisionnement';

    if(userPost === 'demandeur'){
      status = 'pending'
      next_step = 'approvisionnement'
    }else if(userPost === 'approvisionnement'){
      status = 'pending'
      next_step = 'approvisionnement'
    }else if(userPost === 'direction'){
      status = 'approved'
      next_step = 'direction'
    }else if(userPost === 'comptabilite'){
      status = 'precured'
      next_step = 'comptabilite'
    }

    const requisitions = await Requisition.query()
    .where('is_deleted', false)
    .andWhere('status', status)
    .andWhere('next_step', next_step)
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
      const data = request.only(['objet', 'titre','priority','next_step', 'demendeur_id', 'enterprise_id']);
      const comment = request.input('comment');
      const date = DateTime.fromISO(request.input('date'));
      const items = request.input('items') || [];
      let status = request.input('status') || 'pending';
    
      if (!items.length) {
        await trx.rollback();
        return response.badRequest({ message: 'Au moins un article est requis' });
      }

      // chek the user 

      const user  = await User.find(data.demendeur_id);
      if(!user){
        await trx.rollback();
        return response.notFound({message:"User not found"})
      }
      
      // give next step of the requisition. 
      const userPost = user.post;

     
    
    if(userPost === 'demandeur'){
      status = 'pending'
      data.next_step = 'approvisionnement'
    }

    // }else if(userPost === 'approvisionnement'){
    //   status = 'pending'
    //   data.next_step = 'approvisionnement'
    // }else if(userPost === 'direction'){
    //   status = 'approved'
    //   data.next_step = 'direction'
    // }else if(userPost === 'comptabilite'){
    //   status = 'precured'
    //   data.next_step = 'comptabilite'
    // }

      if(userPost === 'comptabilite'){
      status = 'precured'
      data.next_step = 'direction'
    }
  
      // 2. Création de la requête principale
      const requisition = await Requisition.create({ 
        ...data, 
        date,
        status
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
          quantite_recue: Number(item.quantiteDemande) || 0,
          prix_unitaire: Number(item.prix_unitaire) || 0,
          prix_total: Number(item.prix_total) || 0,
          supplier_id: item.supplier_id || null,
          status: item.status || 'en_stock',
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
    .preload('caisse')
    .preload('items', (query) => {
      query.where('requisition_id',params.id)
      query.preload('article')
      query.preload('supplier')
    })
    .preload('attachments')
    .preload('demendeur')
    .orderBy('created_at', 'desc')
    .preload('comments',(query)=>{
      query.preload('user')
    })
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
      const status = request.input('status') || 'pending';
  
      if (!items.length) {
        await trx.rollback();
        return response.badRequest({ message: 'Au moins un article est requis' });
      }

      const apro = {
        precured_at:null,
        rejected_at:null,
        completed_at:null,
        approved_at:null
      }
  
      // 2. Mise à jour de la requête principale
      const requisition = await Requisition.query({ client: trx })
        .where('id', params.id)
        .update({
          ...data,
          ...{next_step: 'approvisionnement'},
          ...apro,
          date,
          status
        });
  
      // 3. Traitement des articles

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
            quantite_recue: Number(item.quantiteDemande) || 0,
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
  async destroy({ params,response }: HttpContext) {
    const requisition =  await Requisition.find(params.id)

    if(!requisition){
      return response.notFound({message:"Requisition not found"})
    }

    await requisition.delete()
    return response.ok(requisition)
  }

async approvisionnement({ response, request }: HttpContext) {
  const trx = await db.transaction();

  try {
    const requisition_id = Number(request.input('requisition_id'));
    const priority = request.input('priority') || 'normal';
    const comment = request.input('comment') || null;
    const user_id = request.input('user_id') || null;
    const items = request.input('items') || [];
    console.log("items : ", items);
    const author = request.input('author') || "Service d'approvisionnement";
    const pieceFiles = request.files('attachments', {
      size: '10mb',
      extnames: ['jpg', 'png', 'pdf', 'docx', 'xlsx', 'webp', 'jpeg'],
    });

    // Vérifier si la réquisition existe et n'est pas supprimée
    const requisition = await Requisition.query({ client: trx })
      .where('id', requisition_id)
      .where('is_deleted', false)
      .first();
    
    if (!requisition) {
      await trx.rollback();
      return response.notFound({ message: 'Requisition not found or deleted!' });
    }

    // Mise à jour de la priorité de la réquisition
    requisition.priority = priority;
    requisition.precured = true;
    requisition.status = 'precured';
    requisition.next_step = 'comptabilite';
    requisition.precured_at = DateTime.now();
    await requisition.useTransaction(trx).save();

    // 1. Valider que tous les articles existent avant de commencer
    const validArticleIds = [];
    for (const item of items) {
      const article_id = Number(item.article_id);
      const articleExists = await Article.query({ client: trx })
        .where('id', article_id)
        .where('is_deleted', false)
        .first();
      
      if (articleExists) {
        validArticleIds.push(article_id);
      } else {
        console.warn(`Article with id ${article_id} not found or deleted, will be skipped`);
      }
    }

    // Marquer comme non acceptés les articles qui ne sont plus dans la liste des articles valides
    if (validArticleIds.length > 0) {
      await RequisitionItem.query({ client: trx })
        .where('requisition_id', requisition.id)
        .whereNotIn('article_id', validArticleIds)
        .update({ accepted: false });
    } else {
      // Si aucun article valide n'est fourni, marquer tous comme non acceptés
      await RequisitionItem.query({ client: trx })
        .where('requisition_id', requisition.id)
        .update({ accepted: false });
    }

    // 2. Traiter uniquement les articles valides
    for (const item of items) {
      const article_id = Number(item.article_id);
      
      // Vérifier si cet article est dans la liste des articles valides
      if (!validArticleIds.includes(article_id)) {
        continue; // Ignorer cet article
      }
      
      // Validation des données numériques
      const prix_unitaire = Number(item.prix_unitaire) || 0;
      const prix_total = Number(item.prix_total) || 0;
      const avance_credit = Number(item.avance_credit) || 0;
      const quantite_demande = Number(item.quantite_demande) || 0;
      const quantite_recue = Number(item.quantite_recue) || 0;

      console.log(`Processing article_id: ${article_id}, prix_unitaire: ${prix_unitaire}, prix_total: ${prix_total}`);

      // Chercher l'article spécifique pour cette réquisition
      const existingItem = await RequisitionItem.query({ client: trx })
        .where('requisition_id', requisition.id)
        .where('article_id', article_id)
        .first();

      if (existingItem) {
        // Mettre à jour l'article existant
        await RequisitionItem.query({ client: trx })
          .where('id', existingItem.id)
          .update({
            prix_unitaire: prix_unitaire,
            prix_total: prix_total,
            transaction_type: item.transaction_type,
            avance_credit: avance_credit,
            supplier_id: item.supplier_id || null,
            quantite_demande: quantite_demande,
            quantite_recue: quantite_recue,
            accepted: true // Marquer comme accepté puisqu'il est dans la liste
          });

          // update article ...
          const suchArticle = await Article.findOrFail(existingItem.article_id);

          await Article.query({client:trx})
          .where('id',existingItem.article_id)
          .update({
            quantite_restante: (existingItem.transaction_type === 'stock'&& suchArticle.quantite_restante > 1) ? Number((suchArticle.quantite_restante) -  Number(quantite_recue)) : suchArticle.quantite_restante
          })

          // create price history
          await PriceHistory.create({
            article_id:existingItem.article_id,
            prix_unitaire:prix_unitaire,
            quantite:quantite_recue,
            date:DateTime.now()
          })
        
        console.log(`Updated existing item for article_id: ${article_id}`);
      } else {
        // Créer un nouvel article item
        await RequisitionItem.create({
          requisition_id: requisition.id,
          article_id: article_id,
          prix_unitaire: prix_unitaire,
          prix_total: prix_total,
          transaction_type: item.transaction_type,
          avance_credit: avance_credit,
          supplier_id: item.supplier_id || null,
          quantite_demande: quantite_demande,
          quantite_recue: quantite_recue,
          accepted: true,
          is_deleted: false
        }, { client: trx });
        
        console.log(`Created new item for article_id: ${article_id}`);
      }
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
        const fileName = `${new Date().getTime()}_${file.clientName}`;
        
        await file.move(app.tmpPath('requisition_attachments'), {
          name: fileName,
          overwrite: true
        });

        if (!file.markAsMoved) {
          throw new Error(`Failed to move file: ${file.errors?.[0]?.message || 'Unknown error'}`);
        }

        await RequisitionAttachment.create({
          requisition_id,
          file_name: fileName,
          file_type: file.type,
          url: `${env.get('API_URL')}attachments/${fileName}`
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
    const trx = await db.transaction();

    const data = request.only([
      'requisition_id',
      'caisse_id',
      'voiture_id',
      'description',
      'status'
    ]) 

    const getcomment = request.input('comment');
    const {comment,author,user_id} = getcomment;
    // const total = Number(request.input('total'));
    const items = request.input('items') || [];

     // Vérifier si la réquisition existe et n'est pas supprimée
    const requisition = await Requisition.query({ client: trx })
      .where('id', params.requisition_id)
      .where('is_deleted', false)
      .first();
    
    
    if (!requisition) {
      await trx.rollback();
      return response.notFound({ message: 'Requisition not found or deleted!' });
    }

        if (!requisition || requisition.is_deleted) {
      return response.notFound({ message: 'Requisition not found or deleted!' });
    }
   

    requisition.status = data.status ==='rejected' ? 'pending': 'approved';
    requisition.next_step = data.status ==='rejected' ? 'approvisionnement':'direction';
    requisition.approved_accounter = data.status ==='rejected' ? false:true;

     if(data.status === "rejected"){
      requisition.rejected_at = DateTime.now()
    }else{
 requisition.approved_at = DateTime.now();
    
    }
   
    
   const kx =  await traitItems(items,requisition,trx)

   const tt = await requisition.useTransaction(kx).save();

   console.log(tt)

    // const  caisse = await Caisse.find(data.caisse_id) || null;
 
    // if(total < Number(caisse?.solde_actuel)){
    // caisse?.merge(
    //   {
    //     solde_actuel:caisse.budget - total
    //   }
    // )
    // caisse?.save();
    // }

    // const SaveOper = await OperationType.updateOrCreate({name:"expenses"},{name:"expenses"})
    
    // await Operation.create({
    //   operation_type_id:SaveOper.id,
    //   caisse_id:caisse?.id || null,
    //   amount:total,
    //   user_id:user_id,
    //   description:data?.description || null
    // })

      // Ajouter un commentaire si fourni
      if (comment) {
        await RequisitionComment.create({
          requisition_id:data.requisition_id,
          comment,
          user_id,
          author
        });
      }

      await trx.commit();
    return response.ok({ 
      message: 'Requisition Approved successfully!',
      requisition_id: requisition.id
    });

  }

  async requisition_articles({response,params}:HttpContext){
    const requisition = await Requisition.find(params.requisition_id);
    const articles = await requisition?.related('items').query();
    return response.send(articles || [])
  }

  async approvDirection({response,params,request}:HttpContext){
     const data = request.only([
      'requisition_id',
      'caisse_id',
      'voiture_id',
      'description',
      'status'
    ]) 
   const trx = await db.transaction(); 

    const getcomment = request.input('comment');
    const {comment,author,user_id} = getcomment;
    const total = Number(request.input('total'));
    const items = request.input('items') || [];

  
    const requisition = await Requisition.find(params.requisition_id);
    if (!requisition || requisition.is_deleted) {
      return response.notFound({ message: 'Requisition not found or deleted!' });
    }
    
    let kx:TransactionClientContract = trx;

    requisition.approved_direction = data.status === 'approved';
    requisition.status = data.status === "rejected" ? "precured" :"completed";
    requisition.next_step = data.status === "rejected" ? "comptabilite" :"completed";

    if(data.status === "rejected"){
      requisition.rejected_at = DateTime.now()
    }else{
      requisition.completed_at =  DateTime.now() ;
    }

    if(data.status === "completed"){
        kx = await traitItemsDirection(items,requisition,trx)
    }
   
    await requisition.useTransaction(kx).save();

    if(requisition.status === "completed"){
      
    const  caisse = await Caisse.find(data.caisse_id) || null;

    if(total < Number(caisse?.solde_actuel)){
    caisse?.merge(
      {
        solde_actuel:Number(caisse.budget) - Number(total)
      }
    )
    caisse?.save();
   }

    const SaveOper = await OperationType.updateOrCreate({name:"expenses"},{name:"expenses"})
    
    await Operation.create({
      operation_type_id:SaveOper.id,
      caisse_id:caisse?.id || null,
      amount:total,
      user_id:user_id,
      description:data?.description || `Paiement pour la requisition: ${requisition.number}.`
    })
}
      // Ajouter un commentaire si fourni
      if (comment) {
        await RequisitionComment.create({
          requisition_id:data.requisition_id,
          comment,
          user_id,
          author
        });
      }

      await trx.commit();
      response.ok({message:"Approved par compatabit"})
  
  }

  async getRequisitionByDemandeur({response,params}:HttpContext){
    const requisitions = await Requisition.query()
    .where('demendeur_id',params.id)
    .andWhereIn('status',['pending','precured'])
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
    .andWhere('status','pending')
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

  async deleteRequisisitionArticle({response,params}:HttpContext){

    const requisition = await Requisition.find(params.requisition_id);
    if(!requisition){
      return response.notFound({message:"Requisition not found"})
    }

    const item = await RequisitionItem.query().where('requisition_id',params.requisition_id).where('article_id',params.item_id).first();

    if(!item){
      return response.notFound({message:"Item not found"})
    }
   await  item.delete();
    return response.ok(item)
  }

  async getHistoryRequisitions({response,request}:HttpContext){
    const page = request.input('page') || 1
    const limit = request.input('limit') || 15

    const requisitions = await Requisition.query()
    .whereIn('status',['approved','rejected','completed','cancelled','rejected','precured'])
    .preload('enterprise')
    .preload('items', (query) => {
      query.preload('article')
      query.preload('supplier')
    })
    .preload('attachments')
    .preload('demendeur')
    .orderBy('created_at', 'desc')
    .paginate(page,limit)

    return response.send(requisitions || [])
  }
  
  async getUserRequesitionHistory({response,request,params}:HttpContext){
    const page = request.input('page') || 1
    const limit = request.input('limit') || 15

    const requisitions = await Requisition.query()
    .where('demendeur_id',params.id)
    .whereIn('status',['approved','rejected','completed','cancelled','rejected','precured'])
    .preload('enterprise')
    .preload('items', (query) => {
      query.preload('article')
       query.preload('supplier')
    })
    .preload('attachments')
    .preload('demendeur')
    .orderBy('created_at', 'desc')
    .paginate(page,limit)

    return response.send(requisitions || [])
  }

  async getEnterpriseHistoryRequisitions({response,params,request}:HttpContext){
    const page = request.input('page') || 1
    const limit = request.input('limit') || 15

    const requisitions = await Requisition.query()
    .where('enterprise_id',params.id)
    .whereIn('status',['approved','rejected','completed','cancelled','rejected','precured'])
    .preload('enterprise')
    .preload('items', (query) => {
      query.preload('article')
       query.preload('supplier')
    })
    .preload('attachments')
    .preload('demendeur')
    .orderBy('created_at', 'desc')
    .paginate(page,limit)

    return response.send(requisitions || [])
  }

  async getUserDraftRequisitions({response,params,request}:HttpContext){
    const page = request.input('page') || 1
    const limit = request.input('limit') || 15

    const requisitions = await Requisition.query()
    .where('demendeur_id',params.id)
    .andWhere('status','draft')
    .preload('enterprise')
    .preload('items', (query) => {
      query.preload('article')
       query.preload('supplier')
    })
    .preload('attachments')
    .preload('demendeur')
    .orderBy('created_at', 'desc')
    .paginate(page,limit)

    return response.send(requisitions || [])
  }

  async getPrecuredRequisition ({response}:HttpContext){
    // const page = request.input('page') || 1
    // const limit = request.input('limit') || 15

    const requisitions = await Requisition.query()
    .andWhereIn('status',['precured','pending'])
    .andWhereIn('next_step',['comptabilite','direction'])
    .preload('enterprise')
    .preload('items', (query) => {
      query.preload('article')
       query.preload('supplier')
    })
    .preload('attachments')
    .preload('demendeur')
    .orderBy('created_at', 'desc')
    // .paginate(page,limit)

    return response.send(requisitions || [])
  }


}