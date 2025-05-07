import Enterprise from '#models/enterprise';
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import bcrypt from "bcryptjs";


export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    return response.json(
      await User.all()
    )
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request,response }: HttpContext) {
    const password = request.input('password');

    const data = request.only([
      'email',
      'enterprise_id',
      'post',
      'username'
    ])

    const userk =  await User.findBy({email:data.email});
    if(userk) return response.unauthorized({message:"Email already Taken"});

   // Hash password
   const hashedPassword = await bcrypt.hash(String(password), 10);

   const user = await User.create({
     ...data,
     password:hashedPassword
   });
   return response.send({message:"User created successfully",user})
  }

  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
    return response.send(
      await User.find(params.id) || {message:"User not found" })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request,response }: HttpContext) {
    const user = await User.find(params.id) 
    if(!user) return response.notFound("User not found");
    const password = request.input('password');

    const data = request.only([
      'email',
      'enterprise_id',
      'post',
      'username'
    ])
     // Hash password
   const hashedPassword = await bcrypt.hash(String(password), 10);

   user.merge({
     ...data,
     password:hashedPassword
   })
    await user.save()
    return response.json({message:"User updated successfully",user});
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const user = await User.find(params.id)
    if(!user) return {message:"User not found"};
    user.is_deleted = true;
    await user.save()
    return {message:"User deleted successfully"}
  }

  /**
   *  get enterprise users
   */

  async getEntepriseUsers({response,params}:HttpContext) {
    const enterprise = await Enterprise.find(params.enterprise_id);
    if(!enterprise){
      return response.notFound({message:"Company not found!"})
    }

    const users =  await User.query()
    .where('is_deleted',false)
    .andWhere('enterprise_id',enterprise.id)
    .preload('enterprise')
    .exec()

    return response.send(users || [])
  }
}