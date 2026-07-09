import { rateLimit } from 'express-rate-limit';
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-8', // Returns rate limit info in standard headers
    legacyHeaders: false, // Disables the older X-RateLimit-* headers
    message: {
      status: 429,
      message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
  });