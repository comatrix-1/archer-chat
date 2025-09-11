const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

import { logger } from '@project/logging/src/index';

if (!JWT_SECRET) {
  logger.fatal('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

if (!REFRESH_TOKEN_SECRET) {
  logger.fatal('REFRESH_TOKEN_SECRET is not defined in environment variables');
  process.exit(1);
}

export { JWT_SECRET, REFRESH_TOKEN_SECRET };
