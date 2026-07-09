import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// GET /api/offers?active=true - public active offers only
// GET /api/offers - admin all offers
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") === "true";
  const session = await getAdminSession();

  const now = new Date();
  const where = activeOnly
    ? {
        active: true,
        startDate: { lte: now },
        endDate: { gte: now },
      }
    : session
    ? {}
    : { active: true, startDate: { lte: now }, endDate: { gte: now } };

  const offers = await db.offer.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(offers);
}

// POST /api/offers
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, image, discount, startDate, endDate, active } = body;

  if (!title || !startDate || !endDate) {
    return NextResponse.json(
      { error: "العنوان وتاريخ البداية والنهاية مطلوبة" },
      { status: 400 }
    );
  }

  const offer = await db.offer.create({
    data: {
      title,
      description,
      image,
      discount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      active: active !== false,
    },
  });

  return NextResponse.json(offer, { status: 201 });
}
