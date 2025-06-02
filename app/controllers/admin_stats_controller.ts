import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class AdminStatsController {

    async dashboard({ response }: HttpContext) {

        const pendingRequisitions  = await db.from('requisitions')
            .where('status', 'pending')
            .count('* as count')
        const approvedRequisitions = await db.from('requisitions')
            .where('status', 'approved')
            .count('* as count')
        const rejectedRequisitions = await db.from('requisitions')
            .where('status', 'rejected')
            .count('* as count')
        const completedRequisitions = await db.from('requisitions')
            .where('status', 'completed')
            .count('* as count')

        const precuredRequisitions = await db.from('requisitions')
            .where('status', 'precured')
            .count('* as count')

        const totalRequisitions = await db.from('requisitions')
            .count('* as count')

        const totalUsers = await db.from('users')
            .where('is_deleted', false)
            .count('* as count')

        const totalEnterprises = await db.from('enterprises')
            .count('* as count')

        const totalRequisitionItems = await db.from('requisition_items')
            .count('* as count')

        return response.send({
            pendingRequisitions: pendingRequisitions[0].count,
            approvedRequisitions: approvedRequisitions[0].count,
            rejectedRequisitions: rejectedRequisitions[0].count,
            completedRequisitions: completedRequisitions[0].count,
            precuredRequisitions: precuredRequisitions[0].count,
            totalRequisitions: totalRequisitions[0].count,
            totalUsers: totalUsers[0].count,
            totalEnterprises: totalEnterprises[0].count,
            totalRequisitionItems: totalRequisitionItems[0].count
        })
    }
}