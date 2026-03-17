import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function isConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.startsWith("your_"));
}

// Chainable no-op that resolves to { data: null, error: null }
function createDummyClient(): SupabaseClient {
  const noopResult = Promise.resolve({ data: null, error: null, count: null, status: 200, statusText: "OK" });
  const chainable: Record<string, unknown> = {};
  const handler: ProxyHandler<Record<string, unknown>> = {
    get: (_target, prop) => {
      if (prop === "then" || prop === "catch" || prop === "finally") {
        return (noopResult as unknown as Record<string, unknown>)[prop as string];
      }
      return (..._args: unknown[]) => new Proxy(chainable, handler);
    },
  };
  return new Proxy(chainable, handler) as unknown as SupabaseClient;
}

let _client: SupabaseClient | null = null;

export const supabase: SupabaseClient = (() => {
  if (!isConfigured()) return createDummyClient();
  if (!_client) _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
})();

export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!isConfigured() || !serviceKey) {
    throw new Error(
      "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }
  return createClient(supabaseUrl, serviceKey);
}
