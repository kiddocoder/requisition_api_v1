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
    const caisses =  await Caisse.all();
    return response.send(caisses || [])
  }


  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const data = request.only([
      'name',
      'budget'
    ])
    const caisse =  await Caisse.updateOrCreate({name:data.name},data);
    await Budget.create({
      caisse_id:caisse.id,
      montant:caisse.budget,
      created_by:null,
      
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
      'alimented_by'
    ])

    const newBudget = caisse.budget + data.budget;
    await Budget.create({
      caisse_id:caisse.id,
    created_by:data.alimented_by,
    montant:newBudget
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

}