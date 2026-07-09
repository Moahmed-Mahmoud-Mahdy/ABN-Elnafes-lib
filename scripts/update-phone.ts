import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Update phone and whatsapp to the new number
  const phone = "01286183415";
  // For WhatsApp we need international format: +20 then strip leading 0
  const whatsapp = "+201286183415";

  await prisma.siteSetting.upsert({
    where: { key: "phone" },
    update: { value: phone },
    create: { key: "phone", value: phone },
  });

  await prisma.siteSetting.upsert({
    where: { key: "whatsapp" },
    update: { value: whatsapp },
    create: { key: "whatsapp", value: whatsapp },
  });

  console.log("✅ Phone updated to:", phone);
  console.log("✅ WhatsApp updated to:", whatsapp);
}

main().catch(console.error).finally(() => prisma.$disconnect());
