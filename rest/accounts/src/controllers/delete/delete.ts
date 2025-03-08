import { Request, Response } from 'express'
import { isValidAuthHeader } from '../../utils'
import { BankAccountStatus } from '../../types'
import { PrismaClient } from '@prisma/client'

export const closeAccount = async (req: Request, res: Response) => {
    const prisma = new PrismaClient()
    try {
        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: No token provided',
            })
        }

        if (!isValidAuthHeader(authHeader)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: Invalid token',
            })
        }

        const accountNumber = req.params.accountNumber
        const account = await prisma.account.findUnique({
            where: { accountNumber },
        })

        if (!account) {
            return res.status(404).json({
                success: false,
                error: 'Account not found',
            })
        }

        account.status = 'CLOSED' as BankAccountStatus

        await prisma.account.update({
            where: { accountNumber },
            data: account,
        })

        res.status(200).json({
            success: true,
            message: 'Account closed successfully',
            data: account,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        })
    } finally {
        await prisma.$disconnect()
    }
}
