import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, getUser } from "@/lib/supabase/server";
import { ApiErrors } from "@/lib/utils/api-error";
import { writeAuditLog } from "@/lib/utils/audit";
import {
  getDownloadLimiter,
  applyRateLimit,
} from "@/lib/utils/ratelimit";

const SIGNED_URL_EXPIRY = 900; // 15 minutes

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Auth required
  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${request.nextUrl.pathname}`, request.url)
    );
  }

  // Rate limit per user
  const limiter = getDownloadLimiter();
  const limited = await applyRateLimit(limiter, `dl:${user.id}`);
  if (limited) return limited;

  const templateId = params.id;
  const supabase = createServiceClient();

  // Check ownership: purchased OR free template
  const { data: template } = await supabase
    .from("templates")
    .select("id, title, file_path, is_free, is_published")
    .eq("id", templateId)
    .eq("is_published", true)
    .single();

  if (!template) return ApiErrors.notFound("Template");

  // If not free, verify purchase
  if (!template.is_free) {
    const { data: purchase } = await supabase
      .from("user_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_type", "template")
      .eq("item_id", templateId)
      .single();

    if (!purchase) return ApiErrors.forbidden();
  }

  // Generate signed URL from private Supabase Storage bucket
  const { data: signedData, error: signedError } = await supabase.storage
    .from("paid-content")
    .createSignedUrl(template.file_path, SIGNED_URL_EXPIRY, {
      download: true,
    });

  if (signedError || !signedData?.signedUrl) {
    console.error("[Download API] Signed URL error:", signedError?.message);
    return ApiErrors.internal("Failed to generate download link");
  }

  // Audit log
  await writeAuditLog({
    user_id: user.id,
    action: "template_download",
    entity_type: "template",
    entity_id: templateId,
    metadata: { title: template.title, is_free: template.is_free },
  });

  // Redirect to the signed URL
  return NextResponse.redirect(signedData.signedUrl);
}
