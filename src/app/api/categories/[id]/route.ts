import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/format";

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
  const { name, description, icon, image } = body;

  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "القسم غير موجود" }, { status: 404 });
  }

  let slug = existing.slug;
  if (name && name !== existing.name) {
    slug = slugify(name);
    const dup = await db.category.findFirst({ where: { slug, NOT: { id } } });
    if (dup) slug = `${slug}-${Date.now()}`;
  }

  const category = await db.category.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      slug,
      description: description !== undefined ? description : existing.description,
      icon: icon !== undefined ? icon : existing.icon,
      image: image !== undefined ? image : existing.image,
    },
  });

  return NextResponse.json(category);
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
  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `لا يمكن حذف القسم لأنه يحتوي على ${productCount} منتج` },
      { status: 400 }
    );
  }

  await db.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
