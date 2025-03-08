import { Request, Response } from 'express'
import { PrismaClient, AccountType } from '@prisma/client'
import { validate as uuidValidate } from 'uuid'

import { NewAccount } from '../../types'
import { isValidAuthHeader } from '../../utils/index'

const prisma = new PrismaClient()

export const createAccount = async (req: Request, res: Response) => {
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

        const { ownerId, accountType = 'SAVINGS' } = req.body as NewAccount

        if (!ownerId || !uuidValidate(ownerId)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid owner ID (UUID format)',
            })
        }

        const existingAccount = await prisma.account.findFirst({
            where: {
                ownerId,
                accountType,
                status: 'ACTIVE',
            },
        })

        if (existingAccount) {
            return res.status(400).json({
                success: false,
                error: `User already has an active ${accountType} account`,
            })
        }

        const newAccount = await prisma.account.create({
            data: {
                ownerId,
                accountType: accountType as AccountType,
            },
        })

        res.status(201).json({
            success: true,
            data: newAccount,
        })
    } catch (error) {
        console.error('Create account error:', error)
        res.status(500).json({
            success: false,
            error: 'Server Error',
        })
    } finally {
        await prisma.$disconnect()
    }
}
