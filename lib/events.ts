import { PostHog } from "posthog-node";

let client: PostHog | null = null;
function get(): PostHog | null {
  if (client) return client;
  const key = process.env.POSTHOG_KEY;
  if (!key) return null;
  client = new PostHog(key, { host: process.env.NEXT_PUBLIC_POSTHOG_HOST });
  return client;
}

export async function track(userId: string, event: string, props: Record<string, unknown> = {}) {
  const c = get();
  if (!c) return;
  c.capture({ distinctId: userId, event, properties: props });
  try {
    await c.flush();
  } catch (err) {
    console.error("PostHog flush failed:", err);
  }
}
