import { createServerClient, serialize, parse } from "@supabase/ssr";

export function createClient(request: Request) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(key: string | number) {
        return cookies[key];
      },
      set(key: any, value: any, options: any) {
        headers.append("Set-Cookie", serialize(key, value, options));
      },
      remove(key: any, options: any) {
        headers.append("Set-Cookie", serialize(key, "", options));
      },
    },
  });
}
