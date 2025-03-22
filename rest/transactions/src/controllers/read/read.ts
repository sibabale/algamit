import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { isValidAuthHeader } from '../../utils'

const prisma = new PrismaClient()

export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !isValidAuthHeader(authHeader)) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid or no token provided',
            })
        }

        const transactions = await prisma.transaction.findMany({
            include: {
                destination: true,
            },
        })

        res.status(200).json({
            success: true,
            data: transactions,
        })
    } catch (error) {
        console.error('Error fetching transactions:', error)
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error,
        })
    }
}

// Get single transaction by ID
export const getTransactionById = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !isValidAuthHeader(authHeader)) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid or no token provided',
            })
        }

        const transaction = await prisma.transaction.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                destination: true,
            },
        })

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found',
            })
        }

        res.status(200).json({
            success: true,
            data: transaction,
        })
    } catch (error) {
        console.error('Error fetching transaction:', error)
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error,
        })
    }
}
