import { Request, Response } from 'express'
import { isValidAuthHeader } from '../../utils'
import { PrismaClient } from '@prisma/client'
// Get all accounts
export const getAllAccounts = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient()
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

        const accounts = await prisma.account.findMany()

        res.status(200).json({
            success: true,
            data: accounts,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        })
    }
}

// Get single account by ID
export const getAccountById = async (req: Request, res: Response) => {
    try {
        const prisma = new PrismaClient()

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
        const accounts = await prisma.account.findMany()

        const accountNumber = req.params.accountNumber
        const account = accounts.find(
            (acc) => acc.accountNumber === accountNumber
        )

        if (!account) {
            return res.status(404).json({
                success: false,
                error: 'Account not found',
            })
        }

        res.status(200).json({
            success: true,
            data: account,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        })
    }
}
