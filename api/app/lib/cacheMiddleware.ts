import { type Request, type Response, type NextFunction } from "express";
import NodeCache from "node-cache";
import { logger } from "@/utils/logger.ts";
export const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
export default function CacheMiddlweare(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const key = `${req.originalUrl}`;
  const cachedResponse = cache.get(key);
  if (cachedResponse) {
    logger.debug(`cache HIT: ${key}`);
    return res.send(cachedResponse);
  }
  logger.debug(`cache MISS: ${key}`);
  next();
}
