import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/format";

// GET /api/products - public list with search/filter/pagination
// GET /api/products?featured=true - featured products
// GET /api/products?latest=true - latest products
// GET /api/products?category=slug - by category
// GET /api/products?search=term - search
// GET /api/products?page=1&limit=12 - pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get("featured") === "true";
  const latest = searchParams.get("latest") === "true";
  const categorySlug = searchParams.get("category");
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "12");
  const skip = (page - 1) * limit;

  const where: {
    active?: boolean;
    featured?: boolean;
    category?: { slug: string };
    OR?: Array<{ name?: { contains: string }; description?: { contains: string } }>;
  } = { active: true };

  if (featured) where.featured = true;
  if (categorySlug) where.category = { slug: categorySlug };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: { position: "asc" } },
      },
      orderBy: latest ? { createdAt: "desc" } : { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// POST /api/products - admin create
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, price, categoryId, stock, minStock, featured, showInOffers, active, images } = body;

  if (!name || !categoryId) {
    return NextResponse.json({ error: "الاسم والقسم مطلوبان" }, { status: 400 });
  }

  let slug = slugify(name);
  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const product = await db.product.create({
    data: {
      name,
      slug,
      description: description || null,
      price: price ? parseFloat(price) : null,
      categoryId,
      stock: parseInt(stock) || 0,
      minStock: parseInt(minStock) || 5,
      featured: !!featured,
      showInOffers: !!showInOffers,
      active: active !== false,
      images: images?.length
        ? {
            create: images.map((url: string, i: number) => ({
              url,
              position: i,
            })),
          }
        : undefined,
    },
    include: { images: true, category: true },
  });

  return NextResponse.json(product, { status: 201 });
}
