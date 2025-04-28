import User from '#models/user';
import type { HttpContext } from '@adonisjs/core/http'
import bcrypt from 'bcryptjs';

export default class UserAuthController {
  
  async login({response,request}: HttpContext) {
    const email = request.input('email');
    const password = request.input('password');

    const user = await User.findBy({email});

    if(!user) return response.unauthorized({message:"Invalid credentials"});

    const isPasswordMatched = await bcrypt.compare(password,user.password);

    if(!isPasswordMatched) return response.unauthorized({message:"Incorrect Password"});

    if(user.is_deleted) return response.unauthorized({message:"User is deleted"});
    user.load('enterprise');

      // Generate token with custom payload
      const token =  user.generateToken(user)

      response.cookie('remember_me_token', token, {
        httpOnly: true,
        
      })

    return response.json({message:"Login successful",user,token});
  }
  
  async logout({}: HttpContext) {}
  
}