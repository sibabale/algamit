import { Router } from 'express'
import { apiRateLimiter } from './utils/index'
import { createTransaction } from './controllers/create/create'
import { getAllTransactions, getTransactionById } from './controllers/read/read'

const router = Router()

router.post('/transactions', apiRateLimiter, createTransaction)
router.get('/transactions', apiRateLimiter, getAllTransactions)
router.get('/transactions/:id', apiRateLimiter, getTransactionById)

export default router
