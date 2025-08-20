import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/router";
import { supabase } from "@project/remix/app/utils/supabaseClient";
import superjson from 'superjson';

// Use the same origin as the current page
const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson, // Add superjson transformer here
      url: `${getBaseUrl()}/api/trpc`,
      async headers() {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;

        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
