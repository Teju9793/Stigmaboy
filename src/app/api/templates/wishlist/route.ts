import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, getUser } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/utils/api-error";

const schema = z.object({
  item_id: z.string().uuid(),
  item_type: z.enum(["course", "template"]),
  action: z.enum(["add", "remove"]),
});

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return ApiErrors.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return ApiErrors.badRequest("Invalid JSON");
  }

  const result = schema.safeParse(body);
  if (!result.success) return ApiErrors.validationError(result.error);

  const { item_id, item_type, action } = result.data;
  const supabase = createClient();

  if (action === "add") {
    const { error } = await supabase.from("wishlist_items").insert({
      user_id: user.id,
      item_type,
      item_id,
    });
    if (error && !error.message.includes("duplicate")) {
      return ApiErrors.internal("Failed to add to wishlist");
    }
  } else {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("item_type", item_type)
      .eq("item_id", item_id);
    if (error) return ApiErrors.internal("Failed to remove from wishlist");
  }

  return NextResponse.json({ success: true, action });
}
