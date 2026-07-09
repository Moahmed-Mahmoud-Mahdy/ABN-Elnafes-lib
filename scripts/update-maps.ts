import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const mapsUrl = "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1219.7446699665254!2d31.399160131626626!3d30.15259484629696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sar!2seg!4v1783559128240!5m2!1sar!2seg";

  await prisma.siteSetting.upsert({
    where: { key: "googleMapsUrl" },
    update: { value: mapsUrl },
    create: { key: "googleMapsUrl", value: mapsUrl },
  });

  console.log("✅ Google Maps URL updated");
}

main().catch(console.error).finally(() => prisma.$disconnect());
