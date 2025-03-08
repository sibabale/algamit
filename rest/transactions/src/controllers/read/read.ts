import { Request, Response } from 'express'
import transactions from '../../data/transactions.json'
import { isValidAuthHeader } from '../../utils'

export const getAllTransactions = (req: Request, res: Response) => {
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

        res.status(200).json({
            success: true,
            data: transactions,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error',
        })
    }
}

// Get single transaction by ID
export const getTransactionById = (req: Request, res: Response) => {
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

        const id = req.params.id
        const transaction = transactions.find((tnx) => tnx.id === id)

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
        res.status(500).json({
            success: false,
            error: 'Server Error',
        })
    }
}
