import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { addStock, removeStock } from "@/lib/stock";

// POST /api/stock - add or remove stock
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, type, quantity, reason } = body;

  if (!productId || !type || !quantity || quantity <= 0) {
    return NextResponse.json(
      { error: "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const userName = session.user?.name ?? "أدمن";

  try {
    if (type === "ADD") {
      await addStock(productId, parseInt(quantity), reason || "توريد جديد", userName);
    } else if (type === "REMOVE") {
      await removeStock(productId, parseInt(quantity), reason || "خصم", userName);
    } else {
      return NextResponse.json({ error: "نوع عملية غير صحيح" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });
    return NextResponse.json({ success: true, product });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "خطأ غير معروف";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// GET /api/stock - stock movement history
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const limit = parseInt(searchParams.get("limit") ?? "100");

  const where = productId ? { productId } : {};
  const movements = await db.stockMovement.findMany({
    where,
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(movements);
}
