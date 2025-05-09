import User from '#models/user'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import colors from 'picocolors'

export default class DeleteAdmin extends BaseCommand {
  static commandName = 'delete:admin'
  static description = 'Delete a super admin user by email address'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: false,
  }

  private showWarning(message: string) {
    this.logger.warning(`${colors.yellow('⚠')} ${colors.yellow(message)}`)
  }

  private showSuccess(message: string) {
    this.logger.success(`${colors.green('✓')} ${colors.green(message)}`)
  }

  private showError(message: string) {
    this.logger.error(`${colors.red('✗')} ${colors.red(message)}`)
  }

  private async validateSuperAdmin(email: string): Promise<User | null> {
    try {
      const user = await User.findBy('email', email)
      if (!user) {
        this.showError(`User with email ${colors.cyan(email)} not found`)
        return null
      }
      if (user.role !== 'super_admin') {
        this.showError(`User ${colors.cyan(email)} is not a super admin`)
        return null
      }
      return user
    } catch (error) {
      this.showError(`Error validating user: ${error.message}`)
      return null
    }
  }

  async run() {
    this.logger.log('')
    this.logger.log(colors.bgRed(colors.white(' ADMIN DELETION WIZARD ')))
    this.logger.log('')

    // Email collection
    const email = await this.prompt.ask('Enter super admin email to delete', {
      validate: async (value) => {
        if (!value.includes('@') || !value.includes('.')) {
          return 'Please enter a valid email address'
        }
        return true
      }
    })

    // Validate the user exists and is a super admin
    const user = await this.validateSuperAdmin(email)
    if (!user) {
      this.exitCode = 1
      return
    }

    // Display user info
    this.logger.log('')
    this.logger.log(colors.bold('User Details:'))
    this.logger.log(`- Email: ${colors.cyan(user.email)}`)
    this.logger.log(`- Username: ${colors.cyan(user.username)}`)
    this.logger.log(`- Role: ${colors.cyan(user.role)}`)
    this.logger.log(`- Created: ${colors.cyan(user.createdAt.toString())}`)
    this.logger.log('')

    // Confirm deletion
    this.showWarning(colors.bold(colors.red('WARNING: This action cannot be undone!')))
    const confirmDelete = await this.prompt.confirm(
      `Are you absolutely sure you want to delete super admin ${colors.cyan(email)}?`,
      { default: false }
    )

    if (!confirmDelete) {
      this.showSuccess('Operation cancelled')
      return
    }

    // Final confirmation
    const confirmFinal = await this.prompt.confirm(
      `Are you absolutely sure you want to permanently delete ${colors.cyan(email)}? This cannot be undone!`,
      {
        hint: 'Type "y" for yes or "n" for no'
      }
    )

    if (!confirmFinal) {
      this.showSuccess('Operation cancelled')
      return
    }

    try {
      // Perform deletion
      await user.delete()
      this.showSuccess(`Super admin ${colors.cyan(email)} has been permanently deleted`)
    } catch (error) {
      this.showError(`Failed to delete user: ${error.message}`)
      this.exitCode = 1
    }
  }
}