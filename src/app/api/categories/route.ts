import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/format";

// GET /api/categories
export async function GET() {
  const categories = await db.category.findMany({
    include: {
      _count: { select: { products: { where: { active: true } } } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

// POST /api/categories
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json();
  const { name, description, icon, image } = body;

  if (!name) {
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  }

  let slug = slugify(name);
  const existing = await db.category.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const category = await db.category.create({
    data: { name, slug, description, icon, image },
  });

  return NextResponse.json(category, { status: 201 });
}
