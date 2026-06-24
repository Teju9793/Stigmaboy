import { createServiceClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

interface AuditLogEntry {
  user_id?: string | null;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
}

// Extract real IP from Vercel headers
export function getClientIp(): string | null {
  const headersList = headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") ?? null;
}

// Write an audit log entry — always uses service role (bypasses RLS)
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createServiceClient();
    const ip = getClientIp();

    await supabase.from("audit_logs").insert({
      user_id: entry.user_id ?? null,
      action: entry.action,
      entity_type: entry.entity_type ?? null,
      entity_id: entry.entity_id ?? null,
      metadata: entry.metadata ?? null,
      ip_address: ip,
    });
  } catch (error) {
    // Audit log failures should never break the main flow
    console.error("[AuditLog] Failed to write:", error);
  }
}
