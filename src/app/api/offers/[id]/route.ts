import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, description, image, discount, startDate, endDate, active } = body;

  const existing = await db.offer.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });
  }

  const offer = await db.offer.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      description: description !== undefined ? description : existing.description,
      image: image !== undefined ? image : existing.image,
      discount: discount !== undefined ? discount : existing.discount,
      startDate: startDate ? new Date(startDate) : existing.startDate,
      endDate: endDate ? new Date(endDate) : existing.endDate,
      active: active ?? existing.active,
    },
  });

  return NextResponse.json(offer);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  await db.offer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
