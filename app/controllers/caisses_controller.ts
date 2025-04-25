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
    .preload('enterprise')
    .orderBy('created_at','desc');

    return response.send(caisses || [])
  }


  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const data = request.only([
      'name',
      'budget',
      'enterprise_id'
    ])
    const caisse =  await Caisse.updateOrCreate({name:data.name},{
      name:data.name,
      budget:Number(data.budget),
      solde_actuel:0,
      enterprise_id:data.enterprise_id || null,
    });

    await Budget.create({
      caisse_id:caisse.id,
      montant:Number(data.budget),
      created_by:null,
      description:'Budget initial',
      enterprise_id:data.enterprise_id || null
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
      montant:Number(data.budget),
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

    return caisse
  }

  /**
   * Delete record
   */
  async destroy({ params,response }: HttpContext) {
    const caisse = await Caisse.findOrFail(params.id);
    await caisse.delete();
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

    const newBudget = parseInt(data.budget) + Number(caisse.solde_actuel);

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

}