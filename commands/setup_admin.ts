import User from '#models/user'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import bcrypt from "bcryptjs";
import { setTimeout } from 'node:timers/promises'
import colors from 'picocolors'

export default class SetupAdmin extends BaseCommand {
  static commandName = 'setup:admin'
  static description = 'Setup initial super admin user with secure temporary credentials'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: false,
  }

  private showProgress(message: string) {
    this.logger.log(`${colors.yellow('⏳')} ${colors.cyan(message)}...`)
  }

  private showSuccess(message: string) {
    this.logger.success(`${colors.green('✓')} ${colors.green(message)}`)
  }

  private showError(message: string) {
    this.logger.error(`${colors.red('✗')} ${colors.red(message)}`)
  }

  private async validateEmail(email: string): Promise<boolean> {
    if (!email || !email.includes('@') || !email.includes('.') || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return false
    }

    try {
      const exists = await User.findBy('email', email)
      if (exists) {
        return false
      }
    } catch {
      return false
    }

    return true
  }

  private generateSecurePassword(length = 12): string {
    const characters = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{};:,.<>/?`~'
    }

    let password = ''
    // Ensure at least one character from each category
    password += characters.uppercase.charAt(Math.floor(Math.random() * characters.uppercase.length))
    password += characters.lowercase.charAt(Math.floor(Math.random() * characters.lowercase.length))
    password += characters.numbers.charAt(Math.floor(Math.random() * characters.numbers.length))
    password += characters.symbols.charAt(Math.floor(Math.random() * characters.symbols.length))

    // Fill the rest randomly
    const allChars = Object.values(characters).join('')
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }

    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('')
  }

  async run() {
    this.logger.log('')
    this.logger.log(colors.bgMagenta(colors.white(' ADMIN SETUP WIZARD ')))
    this.logger.log('')

    // Email collection with validation
    let email: string
    while (true) {
      email = await this.prompt.ask('Enter admin email address', {
        default: 'admin@gmail.com',
        validate: async (value) => {
          if (!await this.validateEmail(value)) {
            return 'Please enter a valid email address'
          }
          return true
        }
      })

      const exists = await User.findBy('email', email)
      if (exists) {
        this.showError(`Email ${colors.yellow(email)} is already registered`)
        const proceed = await this.prompt.confirm('Do you want to reset this user as admin?')
        if (!proceed) continue
        break
      }
      break
    }

    this.logger.log('')
    this.showProgress('Generating secure temporary password')
    await setTimeout(800) // Simulate processing time

    const tempPassword = this.generateSecurePassword()
    this.showSuccess('Password generated successfully')
    this.logger.log('')

    try {
      this.showProgress('Hashing password')
      const hashedPassword = await bcrypt.hash(String(tempPassword), 10);
      await setTimeout(500)
      this.showSuccess('Password secured')

      this.showProgress('Creating admin account')
      await setTimeout(300)

      await User.updateOrCreate(
        { email },
        {
          email,
          username: 'Super Admin',
          post: 'direction',
          password: hashedPassword,
          role: 'super_admin',
          is_temp_password: true,
          must_reset_password: true,
        }
      )

      await setTimeout(800) // Simulate DB operation
      this.showSuccess('Admin account created successfully')
      this.logger.log('')

      // Display results in a box
      const box = this.ui.sticker()
      box.add(`Email: ${colors.cyan(email)}`)
      box.add(`Temporary Password: ${colors.yellow(tempPassword)}`)
      box.add('')
      box.add(colors.red('⚠️ This password will be shown only once'))
      box.add(colors.red('⚠️ User must reset password on first login'))
      box.render()

      this.logger.log('')
      this.logger.log(colors.green('Setup completed successfully!'))
      this.logger.log('')
    } catch (error) {
      this.showError('Failed to create admin account')
      this.logger.error(error.message)
      this.exitCode = 1
      await this.exec()
    }
  }
}