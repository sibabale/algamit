import { Request, Response } from 'express'
import { PrismaClient, TransactionType, Currency } from '@prisma/client'
import { isValidAuthHeader } from '../../utils/index'

const prisma = new PrismaClient()

interface AccountResponse {
    success: boolean
    data: {
        id: string
        balance: number
        ownerId: string
    }
}

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !isValidAuthHeader(authHeader)) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Invalid or no token provided',
            })
        }

        const { type, amount, accountNumber, accountCurrency, destination } =
            req.body

        // Validation checks
        if (
            !type ||
            !amount ||
            amount <= 0 ||
            !destination ||
            !accountNumber ||
            !accountCurrency
        ) {
            return res.status(400).json({
                success: false,
                error: 'Please provide valid type, amount, accountNumber, accountCurrency, destination',
            })
        }

        // Validate transaction type and currency
        if (!Object.values(TransactionType).includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transaction type',
            })
        }

        if (!Object.values(Currency).includes(accountCurrency)) {
            return res.status(400).json({
                success: false,
                error: 'Unsupported currency',
            })
        }

        // Fetch account from accounts service
        const response = await fetch(
            `${process.env.ACCOUNTS_SERVICE_URL}/${accountNumber}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authHeader,
                },
            }
        )

        const account = (await response.json()) as AccountResponse

        if (!account.success) {
            return res.status(404).json({
                success: false,
                error: 'Account not found',
            })
        }

        const currentBalance = account.data.balance
        let newBalance = currentBalance

        // Calculate new balance based on transaction type
        switch (type) {
            case 'DEPOSIT':
                newBalance = currentBalance + amount
                break
            case 'WITHDRAWAL':
            case 'TRANSFER':
                if (amount > currentBalance) {
                    return res.status(400).json({
                        success: false,
                        error: 'Insufficient balance',
                    })
                }
                newBalance = currentBalance - amount
                break
        }

        console.log(account.data)

        // Create transaction using Prisma
        const transaction = await prisma.transaction.create({
            data: {
                type,
                status: 'COMPLETED',
                amount,
                accountId: account.data.id,
                accountBalance: newBalance,
                accountCurrency,
                destination: {
                    create: {
                        ownerId: destination.ownerId || account.data.ownerId,
                        accountNumber: destination.accountNumber,
                    },
                },
            },
            include: {
                destination: true,
            },
        })

        return res.status(201).json({
            success: true,
            data: transaction,
        })
    } catch (error) {
        console.error('Error creating transaction:', error)
        res.status(500).json({
            success: false,
            error: 'Server Error',
        })
    }
}
