import User from '#models/user'
import { BaseMail } from '@adonisjs/mail'

const admin =  await User.findBy({post:'admin'});

if(!admin){
  throw new Error('Admin user not found');
}

/**
 * UserPasswordNotification is a mail class that sends a notification
 * to the user about their password.
 */

export default class UserPasswordNotification extends BaseMail {
  from = admin?.email;
  subject = 'Default Password for Requisition';

  constructor(private user: any) {
    super()
    if (!this.user) {
      throw new Error('User is required to send the password notification');
    }
    
    if (!this.user.default_password) {
      throw new Error('User does not have a default password');
    }
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    this.message.to(this.user.email)
      .htmlView('emails/user_password', {
        user: this.user,
        default_password: this.user.default_password,
      });
  }
}