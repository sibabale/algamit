import { v4 as uuidv4 } from 'uuid'
import { NewTransaction } from '../../types'
import { Request, Response } from 'express'
import { isValidAuthHeader } from '../../utils/index'

interface AccountResponse {
    success: boolean
    data: {
        id: string
        balance: number
    }
}

export const createTransaction = async (req: Request, res: Response) => {
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

        const { type, amount, accountNumber, accountCurrency, destination } =
            req.body

        const supportedCurrencies = ['USD', 'EUR', 'GBP', 'ZAR']
        const supportedTransactionTypes = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER']

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
                error: 'Please provide a validtype, amount, accountNumber, accountCurrency, destination',
            })
        }

        if (!supportedCurrencies.includes(accountCurrency)) {
            return res.status(400).json({
                success: false,
                error: 'Unsupported currency',
            })
        }

        if (!supportedTransactionTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transaction type',
            })
        }

        const newTransaction: NewTransaction = {
            id: uuidv4(),
            type,
            amount,
            destination,
            accountNumber,
            accountCurrency,
        }

        const response = await fetch(
            `http://localhost:3000/api/accounts/${accountNumber}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authHeader,
                },
            }
        )

        const account = (await response.json()) as AccountResponse

        if (account.success) {
            const currentBalance = account.data.balance

            const insufficientBalanceResponse = {
                success: false,
                error: 'Insufficient balance',
            }

            const successResponseData = {
                id: uuidv4(),
                status: 'COMPLETED',
                amount: newTransaction.amount,
                accountId: account.data.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                accountCurrency: newTransaction.accountCurrency,
                destination: {
                    accountNumber: newTransaction.destination.accountNumber,
                },
            }

            if (newTransaction.type === 'DEPOSIT') {
                const newBalance = account.data.balance + newTransaction.amount

                return res.status(201).json({
                    success: true,
                    data: {
                        type: 'DEPOSIT',
                        accountBalance: newBalance,
                        ...successResponseData,
                    },
                })
            } else if (newTransaction.type === 'WITHDRAWAL') {
                if (newTransaction.amount > currentBalance) {
                    return res.status(400).json(insufficientBalanceResponse)
                }
                const newBalance = account.data.balance - newTransaction.amount
                return res.status(201).json({
                    success: true,
                    data: {
                        type: 'WITHDRAWAL',
                        accountBalance: newBalance,
                        ...successResponseData,
                    },
                })
            } else if (newTransaction.type === 'TRANSFER') {
                if (currentBalance - newTransaction.amount < 0) {
                    return res.status(400).json(insufficientBalanceResponse)
                }
                const newBalance = account.data.balance - newTransaction.amount
                return res.status(201).json({
                    success: true,
                    data: {
                        ...successResponseData,
                        type: 'TRANSFER',
                        accountBalance: newBalance,
                    },
                })
            }
        }
        if (!account.success) {
            return res.status(404).json({
                success: false,
                error: 'Account not found',
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: `Server Error: ${error}`,
        })
    }
}
