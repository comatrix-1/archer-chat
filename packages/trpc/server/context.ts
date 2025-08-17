import type { HonoEnv } from "@project/remix/server/router";
import type { Context as HonoContext } from "hono";
import { supabase } from "../supabase-client";

type CreateTrpcContextOptions = {
  c: HonoContext<HonoEnv>;
  requestSource: "app" | "apiV1" | "apiV2";
};

export type BaseContext = {
  user?: {
    id: string;
    email?: string;
    [key: string]: unknown;
  };
  requestSource: string;
};

export type ProtectedContext = BaseContext & {
  user: {
    id: string;
    email?: string;
    [key: string]: unknown;
  };
};

export type Context = BaseContext & {
  hono: HonoContext<HonoEnv>;
};

export const createTrpcContext = async ({
  c,
  requestSource,
}: CreateTrpcContextOptions): Promise<Context> => {
  const authHeader = c.req.header("authorization");
  let user: BaseContext["user"] | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error("Error verifying token:", error);
      return {
        hono: c,
        user,
        requestSource,
      };
    }

    if (data?.user) {
      user = {
        id: data.user.id as string,
        email: data.user.email as string,
      };
      console.log("context set user successfully", user);
    }
  }

  return {
    hono: c,
    user,
    requestSource,
  };
};
