import { PrismaClient } from '@prisma/client'
import axios from 'axios'
import dotenv from 'dotenv'
import { Request, Response } from 'express'
import { configureAxiosRetry } from '../../utils/index'

dotenv.config()

const prisma = new PrismaClient()

const axiosTransactionsServiceInstance = axios.create({
    baseURL: process.env.TRANSACTIONS_SERVICE_URL,
    timeout: 5000,
})

console.log(process.env.TRANSACTIONS_SERVICE_URL)
configureAxiosRetry(axiosTransactionsServiceInstance)

export const addFundsToFixedDeposit = async (req: Request, res: Response) => {
    try {
        const { fixedDepositId, additionalAmount } = req.body

        if (!fixedDepositId || !additionalAmount) {
            return res.status(400).json({
                success: false,
                error: 'Please provide both fixedDepositId and additionalAmount',
            })
        }

        // Fetch the existing fixed deposit
        const fixedDeposit = await prisma.fixedDeposit.findUnique({
            where: { id: fixedDepositId },
        })

        if (!fixedDeposit) {
            return res.status(404).json({
                success: false,
                error: 'Fixed Deposit not found',
            })
        }

        // Check if the fixed deposit has matured
        const currentDate = new Date()
        if (fixedDeposit.maturityDate <= currentDate) {
            return res.status(400).json({
                success: false,
                error: 'Cannot add funds to a matured Fixed Deposit',
            })
        }

        // Calculate the new balance
        const newBalance =
            Number(fixedDeposit.balance) + Number(additionalAmount)

        console.log('newBalance: ----', newBalance)
        console.log('fixedDeposit.balance: ----', fixedDeposit.balance)
        console.log('additionalAmount: ----', additionalAmount)

        // Define the maximum allowable balance based on precision and scale
        const maxBalance = 10 ** 18 - 0.01 // For Decimal(20, 2)

        // Check for overflow
        if (newBalance >= maxBalance) {
            return res.status(400).json({
                success: false,
                error: 'Balance overflow: The resulting balance exceeds the maximum allowable value.',
            })
        }

        // Update the balance of the fixed deposit
        const updatedFixedDeposit = await prisma.fixedDeposit.update({
            where: { id: fixedDepositId },
            data: {
                balance: newBalance,
            },
        })

        console.log(
            'axiosTransactionsServiceInstance: ----',
            axiosTransactionsServiceInstance
        )

        // Record the transaction in the transactions service
        await axiosTransactionsServiceInstance.post(
            '/api/transactions',
            {
                type: 'FIXED_DEPOSIT',
                amount: additionalAmount,
                currency: 'USD',
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
                },
            }
        )

        res.status(200).json({
            success: true,
            data: updatedFixedDeposit,
        })
    } catch (error: any) {
        console.error('Error adding funds to fixed deposit:', error)

        // Check if the error is an Axios error
        if (axios.isAxiosError(error) && error.response) {
            // Extract the error message from the Axios response
            const errorMessage =
                error.response.data.error || 'An error occurred'

            // Send the extracted error message in the response
            return res.status(error.response.status).json({
                success: false,
                error: errorMessage,
            })
        }

        // Fallback for non-Axios errors
        res.status(500).json({
            success: false,
            error: 'Server error: ' + error.message,
        })
    } finally {
        await prisma.$disconnect()
    }
}
