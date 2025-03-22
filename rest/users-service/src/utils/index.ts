import { rateLimit } from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 2, // limit each IP to 2 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});
