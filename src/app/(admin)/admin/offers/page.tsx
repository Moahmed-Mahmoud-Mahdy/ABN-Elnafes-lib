import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import OffersAdminClient from "@/components/admin/offers-admin-client";

export default async function AdminOffersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const offers = await db.offer.findMany({ orderBy: { createdAt: "desc" } });

  // Serialize dates
  const serialized = offers.map((o) => ({
    ...o,
    startDate: o.startDate.toISOString(),
    endDate: o.endDate.toISOString(),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));

  return <OffersAdminClient offers={serialized} />;
}
