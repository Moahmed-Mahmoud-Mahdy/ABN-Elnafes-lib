import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/format";

// GET /api/products/[id] - public single product
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const product = await db.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      active: true,
    },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  // Get similar products from same category
  const similar = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      active: true,
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    take: 4,
  });

  return NextResponse.json({ product, similar });
}

// PUT /api/products/[id] - admin update
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
  const { name, description, price, categoryId, minStock, featured, showInOffers, active, images } = body;

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  let slug = existing.slug;
  if (name && name !== existing.name) {
    slug = slugify(name);
    const dup = await db.product.findFirst({ where: { slug, NOT: { id } } });
    if (dup) slug = `${slug}-${Date.now()}`;
  }

  // Replace images if provided
  if (images !== undefined) {
    await db.productImage.deleteMany({ where: { productId: id } });
    if (images.length) {
      await db.productImage.createMany({
        data: images.map((url: string, i: number) => ({
          productId: id,
          url,
          position: i,
        })),
      });
    }
  }

  const product = await db.product.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      slug,
      description: description !== undefined ? description || null : existing.description,
      price: price !== undefined ? (price ? parseFloat(price) : null) : existing.price,
      categoryId: categoryId ?? existing.categoryId,
      minStock: minStock !== undefined ? parseInt(minStock) : existing.minStock,
      featured: featured ?? existing.featured,
      showInOffers: showInOffers ?? existing.showInOffers,
      active: active ?? existing.active,
    },
    include: { images: true, category: true },
  });

  return NextResponse.json(product);
}

// DELETE /api/products/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
