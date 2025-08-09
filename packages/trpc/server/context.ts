import type { HonoEnv } from '@project/remix/server/router';
import type { Context as HonoContext } from 'hono';

type CreateTrpcContextOptions = {
  c: HonoContext<HonoEnv>;
  requestSource: 'app' | 'apiV1' | 'apiV2';
};

export type BaseContext = {
  user?: {
    id: string;
    [key: string]: unknown;
  };
  teamId?: string;
  [key: string]: unknown;
};

export type ProtectedContext = BaseContext & {
  user: {
    id: string;
    [key: string]: unknown;
  };
  teamId: string;
};

export type Context = HonoContext<HonoEnv> & BaseContext;

export const createTrpcContext = async ({
  c,
  requestSource,
}: CreateTrpcContextOptions): Promise<Context> => {
  // Here you can extract user info from the request (e.g., from cookies, headers, etc.)
  // For example:
  // const user = await getUserFromRequest(_opts.req);
  // const teamId = getTeamIdFromRequest(_opts.req);

  return c as Context;
};