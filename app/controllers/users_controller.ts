// import UserPasswordNotification from '#mails/user_password_notification';
import AssignUser from '#models/assign_user';
import Enterprise from '#models/enterprise';
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db';
// import mail from '@adonisjs/mail/services/main';
import bcrypt from "bcryptjs";


export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
   const users = await User.query()
   .where('is_deleted',false)
   .preload('enterprise')
   .orderBy('created_at','desc')
   .orderBy('post','desc')
   .orderBy('username','desc')
   .exec();

    return response.send(users || [])
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
    if(userk && !userk.is_deleted){
       return response.unauthorized({message:"Email already Taken"});
    } 

   // Hash password
   const hashedPassword = await bcrypt.hash(String(password), 10);

  //  mail.send(new UserPasswordNotification({...userk, default_password: password}));

   const user = await User.updateOrCreate({email:data.email},{
     ...data,
     is_deleted:false,
     password:hashedPassword
   });
   return response.send({message:"User created successfully",user})
  }

  /**
   * Show individual record
   */
  async show({ params,response }: HttpContext) {
   const user = await User.find(params.id)
   if(!user){
    return response.notFound({message:"User not found"})
   }
   user.load('enterprise')
   return response.send(user)
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

     // Hash password and merge hashed password to the user
     if(password){
        const hashedPassword = await bcrypt.hash(password, 10);
        user.merge({
          password:hashedPassword
        })
     }

   user.merge({
     ...data,
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

  async assignUsersOnCompanies({ response, request }: HttpContext) {
    const usersIds = request.input('users');
    const enterprisesIds = request.input('enterprises');
  
    // Validate inputs
    if (!usersIds || !enterprisesIds) {
      return response.badRequest({ message: "Users and enterprises IDs are required" });
    }
  
    try {
      // Get all users and enterprises at once to minimize database queries
      const users = await User.query().whereIn('id', usersIds);
      const enterprises = await Enterprise.query().whereIn('id', enterprisesIds);
  
      // Check if all users and enterprises exist
      if (users.length !== usersIds.length) {
        return response.notFound({ message: "One or more users not found" });
      }
      if (enterprises.length !== enterprisesIds.length) {
        return response.notFound({ message: "One or more enterprises not found" });
      }
  
      // Prepare relationships to insert
      let relations:any = [];
      for (const enterprise of enterprises) {
        for (const user of users) {
          relations.push({
            user_id: user.id,
            enterprise_id: enterprise.id
          });
        }
      }
  
      // Use transaction for atomic operations
      await db.transaction(async (trx) => {
        // First delete existing relations for these users and enterprises to avoid duplicates
        await AssignUser.query()
          .whereIn('user_id', usersIds)
          .whereIn('enterprise_id', enterprisesIds)
          .useTransaction(trx)
          .delete();
  
        // Then insert all new relations at once
        await AssignUser.createMany(relations,{client:trx});
      });
  
      return { message: "Users assigned successfully" };
    } catch (error) {
      return response.internalServerError({ 
        message: "Failed to assign users to enterprises",
        error: error.message 
      });
    }
  }

  async deleteDefinitlyUser({response,params}:HttpContext){
    const user = await User.find(params.id);
    if(!user){
      return response.notFound({message:"User not found!"})
    }

    await user.delete();
    return response.ok(user)
  }

}