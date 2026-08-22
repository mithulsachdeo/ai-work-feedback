import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerClient } from "@/lib/supabase/server";
import { track } from "@/lib/events";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handled when called in context where response headers cannot be modified
          }
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { rating, tags, comment, page } = await req.json();
  const cleanTags: string[] = Array.isArray(tags) ? tags.filter((t) => typeof t === "string") : [];
  const cleanComment = typeof comment === "string" ? comment.trim() : "";

  if (typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5." }, { status: 400 });
  }
  if (cleanTags.length === 0 && cleanComment.length === 0) {
    return NextResponse.json({ error: "Add a tag or a comment." }, { status: 400 });
  }

  const db = getServerClient();
  const { error } = await db.from("product_feedback").insert({
    user_id: user.id,
    rating,
    tags: cleanTags,
    comment: cleanComment || null,
    page: typeof page === "string" ? page.slice(0, 200) : null,
  });
  if (error) return NextResponse.json({ error: "Couldn't save feedback." }, { status: 500 });

  // Mirrors rating + tags to PostHog for a quick dashboard view — deliberately excludes
  // the free-text comment, which may contain more personal reflection than a rating/tag
  // and doesn't need to leave the DB to be useful in aggregate.
  track(user.id, "product_feedback_submitted", {
    rating,
    tags: cleanTags,
    hasComment: cleanComment.length > 0,
  });

  return NextResponse.json({ ok: true });
}
