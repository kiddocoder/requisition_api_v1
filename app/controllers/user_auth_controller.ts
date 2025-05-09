import User from '#models/user';
import type { HttpContext } from '@adonisjs/core/http'
import bcrypt from 'bcryptjs';
import { DateTime } from 'luxon';
import crypto from 'crypto';

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

     // Check if password needs reset
     if (user.must_reset_password) {
      return response.status(403).json({
        status: 'password reset required!',
        message: 'You must reset your password before logging in'
      })
    }

      // Generate token with custom payload
      const token =  user.generateToken(user)

      response.cookie('remember_me_token', token, {
        httpOnly: true,
        
      })

    return response.json({message:"Login successful",user,token});
  }
  
  async logout({}: HttpContext) {}

  public async resetPassword({ request, response }:HttpContext) {
    const { token, newPassword } = request.only(['token', 'newPassword'])
    
    const user = await User.query()
        .where('password_reset_token', token)
        .where('token_created_at', '>', DateTime.now().minus({ hours: 24 }).toSQL())
        .firstOrFail()

    if(!user) return response.notFound('User not found')

    user.password = await bcrypt.hash(String(newPassword), 10)
    user.must_reset_password = false
    user.is_temp_password = false
    user.password_reset_token = null
    user.token_created_at = null

    await user.save()

    return response.json({
      message: 'Password reset successfully'
    })
  }

  public async requireReset({ params, response }:HttpContext) {
    const user = await User.findByOrFail({ must_reset_password: true, id: params.id })

    if(!user) return response.notFound('User not found')
    
    // Generate reset token
    const resetToken = crypto.randomBytes(64).toString('hex')
    
    user.password_reset_token = resetToken
    user.token_created_at = DateTime.now()

    await user.save()

    return response.json({
      resetToken: resetToken,
      message: 'Password reset required'
    })
  }
  
}