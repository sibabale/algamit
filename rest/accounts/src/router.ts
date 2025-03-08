import { Router } from 'express';
import { closeAccount } from './controllers/delete/delete';
import { createAccount } from './controllers/create/create';
import { apiRateLimiter } from './utils/index'
import { updateAccountOwner } from './controllers/update/update';
import { getAllAccounts, getAccountById } from './controllers/read/read';

const router = Router();

router.post('/accounts', apiRateLimiter, createAccount);
router.get('/accounts', apiRateLimiter, getAllAccounts);
router.get('/accounts/:accountNumber', apiRateLimiter, getAccountById);
router.delete('/accounts/:id', apiRateLimiter, closeAccount);
router.put('/accounts/:id', apiRateLimiter, updateAccountOwner);

export default router;