import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSettings } from "@/lib/settings";
import SettingsClient from "@/components/admin/settings-client";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const settings = await getSettings();

  return <SettingsClient initial={settings} />;
}
