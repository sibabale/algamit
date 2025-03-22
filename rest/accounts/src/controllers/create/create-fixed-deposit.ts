import axios from 'axios'
import dotenv from 'dotenv'
import axiosRetry from 'axios-retry'
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { validate as uuidValidate } from 'uuid'

import { isValidAuthHeader } from '../../utils/index'

dotenv.config()

const prisma = new PrismaClient()

const axiosUserServiceInstance = axios.create({
    baseURL: process.env.USERS_SERVICE_URL,
    timeout: 5000,
})

axiosRetry(axiosUserServiceInstance, {
    retries: 3,
    retryDelay: (retryCount) => {
        return retryCount * 1000
    },
    retryCondition: (error) => {
        return (
            axiosRetry.isNetworkOrIdempotentRequestError(error) ||
            (error.response ? error.response.status >= 500 : false)
        )
    },
})

export const createFixedDeposit = async (req: Request, res: Response) => {
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

        const { userId, name, balance, maturityDate } = req.body

        if (!userId || !uuidValidate(userId)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid user ID (UUID format)',
            })
        }

        let userExists
        try {
            userExists = await axiosUserServiceInstance.get(
                `/api/users/${userId}`
            )
        } catch (error) {
            return res.status(404).json({
                success: false,
                error: 'User not found or service unavailable',
            })
        }

        if (!name || !balance || !maturityDate) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields: name, balance, maturityDate',
            })
        }

        const currentDate = new Date()
        const maturity = new Date(maturityDate)
        const minMaturity = new Date(currentDate)
        minMaturity.setDate(minMaturity.getDate() + 1)
        const maxMaturity = new Date(currentDate)
        maxMaturity.setFullYear(maxMaturity.getFullYear() + 80)

        if (maturity < currentDate) {
            return res.status(400).json({
                success: false,
                error: 'Maturity date cannot be in the past',
            })
        }

        if (maturity < minMaturity || maturity > maxMaturity) {
            return res.status(400).json({
                success: false,
                error: 'Maturity date must be at least 1 day and no more than 80 years from today',
            })
        }

        const newFixedDeposit = await prisma.fixedDeposit.create({
            data: {
                name,
                userId,
                status: 'ACTIVE',
                balance,
                interestRate: 0.05, // Default interest rate
                maturityDate: maturity,
            },
        })

        res.status(201).json({
            success: true,
            data: newFixedDeposit,
        })
    } catch (error) {
        console.error('Create fixed deposit error:', error)
        res.status(500).json({
            success: false,
            error: 'Server Error',
        })
    } finally {
        await prisma.$disconnect()
    }
}
