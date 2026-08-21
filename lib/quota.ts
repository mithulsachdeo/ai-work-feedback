import { DAILY_QUOTA } from "@/constants";
import { getServerClient } from "./supabase/server";

interface Deps {
  used: (u: string) => Promise<number>;
  consume: (u: string) => Promise<void>;
}

const defaults: Deps = {
  used: async (u) => {
    const sb = getServerClient();
    const { data, error } = await sb.rpc("used_today", { p_user: u });
    if (error) throw error;
    return (data as number) ?? 0;
  },
  consume: async (u) => {
    const sb = getServerClient();
    const { error } = await sb.rpc("consume_quota", { p_user: u });
    if (error) throw error;
  },
};

// Read-only: how many checks the user has left today.
export async function getRemaining(userId: string, deps: Deps = defaults): Promise<number> {
  const used = await deps.used(userId);
  return Math.max(0, DAILY_QUOTA - used);
}

// Increment — call ONLY after a successful, parsed evaluation.
export async function consumeQuota(userId: string, deps: Deps = defaults): Promise<void> {
  await deps.consume(userId);
}
