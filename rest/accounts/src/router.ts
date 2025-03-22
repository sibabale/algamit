import { Router } from 'express'
import { closeAccount } from './controllers/delete/delete'
import { createAccount } from './controllers/create/create'
import { apiRateLimiter } from './utils/index'
import { updateAccountOwner } from './controllers/update/update'
import { createFixedDeposit } from './controllers/create/create-fixed-deposit'
import { getAllAccounts, getAccountById } from './controllers/read/read'
const router = Router()

router.post('/accounts', apiRateLimiter, createAccount)
router.get('/accounts', apiRateLimiter, getAllAccounts)
router.get('/accounts/:accountNumber', apiRateLimiter, getAccountById)
router.delete('/accounts/:accountNumber', apiRateLimiter, closeAccount)
router.put('/accounts/:accountNumber', apiRateLimiter, updateAccountOwner)
router.post('/accounts/fixed-deposits', apiRateLimiter, createFixedDeposit)

export default router
