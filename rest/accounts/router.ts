import { Router } from 'express';
import { getAllAccounts, getAccountById } from './controllers/read/read';

const router = Router();

router.get('/accounts', getAllAccounts);
router.get('/accounts/:id', getAccountById);

export default router;