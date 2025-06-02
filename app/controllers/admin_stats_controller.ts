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
            requisitions:{
                status:{
                    pending: parseInt(pendingRequisitions[0].count),
                    approved: parseInt(approvedRequisitions[0].count),
                    rejected: parseInt(rejectedRequisitions[0].count),
                    completed: parseInt(completedRequisitions[0].count),
                    precured: parseInt(precuredRequisitions[0].count)
                },
                total: parseInt(totalRequisitions[0].count),
                items: parseInt(totalRequisitionItems[0].count)
            },
            users:{
                total: parseInt(totalUsers[0].count),
                suspended: await db.from('users')
                    .where('is_deleted', true)
                    .count('* as count')
                    .then(res => parseInt(res[0].count))
                
            },
            enterprises:{
                total: parseInt(totalEnterprises[0].count),
                archived: await db.from('enterprises')
                    .where('is_deleted', true)
                    .count('* as count')
                    .then(res => parseInt(res[0].count))
            },
        })
    }
}