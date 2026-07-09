import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import PublicHeader from "@/components/public/header";
import PublicFooter from "@/components/public/footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, settings] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, icon: true },
    }),
    getSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader categories={categories} settings={settings} />
      <main className="flex-1">{children}</main>
      <PublicFooter settings={settings} categories={categories} />
    </div>
  );
}
