import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getSettings, updateSettings, DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings";

// GET /api/settings - public
export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

// PUT /api/settings - admin
export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json();
  const validKeys = Object.keys(DEFAULT_SETTINGS);
  const filtered: Partial<SiteSettings> = {};
  for (const key of validKeys) {
    if (key in body) {
      (filtered as Record<string, string>)[key] = String(body[key]);
    }
  }

  await updateSettings(filtered);
  const updated = await getSettings();
  return NextResponse.json(updated);
}
