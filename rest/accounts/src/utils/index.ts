import { rateLimit } from 'express-rate-limit'

import { AxiosInstance } from 'axios'
import axiosRetry from 'axios-retry'

export const apiRateLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 2, // limit each IP to 2 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
    },
})

export function isValidAuthHeader(authHeader: string | undefined): boolean {
    const expectedToken = 'Bearer ba_123456789'
    return authHeader === expectedToken
}

export const configureAxiosRetry = (axiosInstance: AxiosInstance) => {
    axiosRetry(axiosInstance, {
        retries: 3, // Number of retries
        retryDelay: (retryCount) => {
            return retryCount * 1000 // Exponential backoff
        },
        retryCondition: (error) => {
            // Retry on network errors or 5xx status codes
            return (
                axiosRetry.isNetworkOrIdempotentRequestError(error) ||
                (error.response ? error.response.status >= 500 : false)
            )
        },
    })
}
