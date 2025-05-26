import { BaseMail } from '@adonisjs/mail'

export default class SendAdminPasswordNotification extends BaseMail {

  from = 'ndayikezatresor9@gmail.com'
  subject = 'Admin Password'
  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */

  constructor(private user: any) {
    super()
  }


  prepare() {
    this.message.to(
      this.user.email
    )
    .htmlView('emails/admin_password', {
      user: this.user,
      password: this.user.default_password,
    });

  }
}