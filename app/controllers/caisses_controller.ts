import Budget from '#models/budget';
import Caisse from '#models/caisse'
import Notification from '#models/notification';
import Operation from '#models/operation';
import OperationType from '#models/operation_type';
import type { HttpContext } from '@adonisjs/core/http'

export default class CaissesController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    const caisses =  await Caisse.query()
    .where('is_deleted', false)
    .preload('enterprise')
    .orderBy('created_at','desc');

    if(!caisses || caisses.length == 0){
      return response.send([])
    }

    return response.send(caisses)
  }


  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const data = request.only([
      'name',
      'budget',
      'enterpriseId',
      'alimented_by'
    ])
    const caisse =  await Caisse.updateOrCreate({name:data.name},{
      name:data.name,
      budget:Number(data.budget),
      solde_actuel:0,
      alimented_by:data.alimented_by || null,
      enterprise_id:data.enterpriseId|| null,
    });

    await Budget.create({
      caisse_id:caisse.id,
      montant:Number(data.budget),
      created_by: data.alimented_by || null,
      description:'Budget initial',
      enterprise_id:data.enterpriseId|| null
    })

    await Notification.create({
      title:"Caisse created",
      message:`${caisse.name} created with new budget ${data.budget}`,
      to:'user',
      user_id:data.alimented_by || null,
    })

    const operation = await OperationType.findBy({name:'deposits'}) || null;

    // create operation
    await Operation.create({
      operation_type_id:operation?.id || null,
      user_id:data.alimented_by || null,
      amount:data.budget,
      caisse_id:caisse.id ,
      description:`${caisse.name} created with new budget ${data.budget}`
    })

    return response.send(caisse)
  } 
  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    const caisse = await Caisse.find(params.id);
    return response.send(caisse || {message:"Not casse found !"})
  }

  /**
   * Handle form submission for the edit action 
   */
  async update({ params, request }: HttpContext) {
    const caisse = await Caisse.findOrFail(params.id)
    const data = request.only([
      'name',
      'budget',
      'alimented_by'
    ])
    await caisse.merge(data).save()

    if(!data.budget){
    await Budget.create({
      caisse_id:caisse.id,
      montant:parseInt(data.budget),
      created_by:data.alimented_by || null,
      description:'Mise à jour du budget initial de la caisse',
      enterprise_id:caisse.enterprise_id || null
    })
  }

    await Notification.create({
      title:"Caisse updated",
      message:`${caisse.name} updated with new budget ${data.budget}`,
      to:'user',
      user_id:data.alimented_by || null
    })

    const operation = await OperationType.findBy({name:'deposits'}) || null;
    // create operation
    await Operation.create({
      operation_type_id:operation?.id || null,
      user_id:data.alimented_by || null,
      amount:data.budget,
      caisse_id:caisse.id ,
      description:`${caisse.name} updated with new budget ${data.budget}`
    })

    return caisse
  }

  /**
   * Delete record
   */
  async destroy({ params,response }: HttpContext) {
    const caisse = await Caisse.findOrFail(params.id);
    caisse.is_deleted = true;
    caisse.save();
    return response.ok({ message: 'Caisse deleted' })
  }

  /* Alimentation de la caisse*/

  async alimentation({params,request,response}:HttpContext){
    const caisse = await Caisse.find(params.id);
    if(!caisse){
      return response.notFound({message:"Caisse not Found !"})
    }
    const data = request.only([
      'caisse_id',
      'budget',
      'alimented_by',
      'enterprise_id',
      'description'
    ])

    const newBudget = parseInt(data.budget) + Number(caisse.budget) 

    await caisse.merge({
      budget:newBudget,
      alimented_by:data.alimented_by || null,
      solde_actuel:caisse.solde_actuel
    }).save()

    // create a budget
    await Budget.create({
      caisse_id:caisse.id,
    created_by:data.alimented_by,
    enterprise_id:data.enterprise_id,
    montant:newBudget,
    description:data.description || null
    })

    // create a notification

    await Notification.create({
      title:"Caisse Alimented",
      message:`${caisse.name} Alimented with new budget ${newBudget} on exisiting solde ${caisse.solde_actuel}`,
      to:'user',
      user_id:data.alimented_by || null
    })


    // create operation 
    const operation = await OperationType.findBy({name:'deposits'}) || null;

    await Operation.create({
      operation_type_id:operation?.id || null,
      user_id:data.alimented_by || null,
      amount:data.budget,
      caisse_id:caisse.id ,
      description:`${caisse.name} Alimented with new budget ${newBudget} on exisiting solde ${caisse.solde_actuel}`
    })

    return response.ok({message :`${caisse.name} Alimented with new budget ${newBudget} on exisiting solde ${caisse.solde_actuel}`})
  }

  /* get caisse by enterprise */

  async getCaisseByEnterprise({params,response}:HttpContext){
    const enterprise = await Caisse.find(params.id);
    if(!enterprise){
      return response.notFound({message:"Enterprise not Found !"})
    }
    const caisses = await Caisse.query().where('enterprise_id',params.id).orderBy('created_at','desc').exec();
    return response.send(caisses || {message:"Not casse found !"})
  }

  async getCaisseOperations({params,response}:HttpContext){
    const caisse = await Caisse.find(params.id);
    if(!caisse){
      return response.notFound({message:"Caisse not Found !"})
    }
    const operations = await Operation.query().where('caisse_id',params.id)
    .preload('enterprise')
    .preload('operation_type')
    .preload('user')
    .orderBy('created_at','desc')
    .exec();

    return response.send(operations || {message:"Not casse found !"})
  }

  async getCaisseBudgets({params,response}:HttpContext){
    const caisse = await Caisse.find(params.id);
    if(!caisse){
      return response.notFound({message:"Caisse not Found !"})
    }
    const budgets = await Budget.query().where('caisse_id',params.id)
    .preload('enterprise')
    .preload('creator')
    .preload('caisse')
    .orderBy('created_at','desc')
    .exec();

    return response.send(budgets || {message:"Not casse found !"})
  }

}