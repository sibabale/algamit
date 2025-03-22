import { Router } from 'express';
import { apiRateLimiter } from './utils/index';

import { login } from './controllers/login/login';
import { register } from './controllers/register/register';
import { getUserById } from './controllers/read/read';

const router = Router();

router.post('/login', apiRateLimiter, login);
router.post('/register', apiRateLimiter, register);
router.get('/users/:userId', getUserById);

export default router;
