import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/utils/api-error";
import {
  getDownloadLimiter,
  applyRateLimit,
} from "@/lib/utils/ratelimit";

const progressSchema = z.object({
  course_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  completed: z.boolean(),
  watched_pct: z.number().int().min(0).max(100),
});

export async function POST(request: NextRequest) {
  // Auth check
  const user = await getUser();
  if (!user) return ApiErrors.unauthorized();

  // Rate limit — 20/min per user
  const limiter = getDownloadLimiter();
  const limited = await applyRateLimit(limiter, `progress:${user.id}`);
  if (limited) return limited;

  // Validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ApiErrors.badRequest("Invalid JSON body");
  }

  const result = progressSchema.safeParse(body);
  if (!result.success) return ApiErrors.validationError(result.error);

  const { course_id, lesson_id, completed, watched_pct } = result.data;

  // Verify the user actually owns this course before writing progress
  const supabase = createServiceClient();

  const { data: purchase } = await supabase
    .from("user_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", "course")
    .eq("item_id", course_id)
    .single();

  if (!purchase) {
    return ApiErrors.forbidden();
  }

  // Upsert progress
  const { error } = await supabase.from("course_progress").upsert(
    {
      user_id: user.id,
      course_id,
      lesson_id,
      completed,
      watched_pct,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    console.error("[Progress API]", error.message);
    return ApiErrors.internal("Failed to save progress");
  }

  return NextResponse.json({ success: true });
}
