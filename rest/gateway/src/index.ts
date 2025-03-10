import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { morganLogger, winstonLogger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100    
});
app.use(limiter);


app.use(morganLogger);

// Proxy configuration
const accountsProxy = createProxyMiddleware({
  target: process.env.ACCOUNTS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/accounts': '/api/accounts'
  }
});

const transactionsProxy = createProxyMiddleware({
  target: process.env.TRANSACTIONS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/transactions': '/api/transactions'
  }
});

app.use('/api/accounts', accountsProxy);
app.use('/api/transactions', transactionsProxy);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  winstonLogger.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  winstonLogger.info(`API Gateway is running on port ${PORT}`);
}); 