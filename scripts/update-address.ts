import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const address = "شارع ابن النفيس، شارع جمال  بقرب محطه الهايكستب ، القاهرة، مصر";

  await prisma.siteSetting.upsert({
    where: { key: "address" },
    update: { value: address },
    create: { key: "address", value: address },
  });

  console.log("✅ Address updated in database to:", address);
}

main().catch(console.error).finally(() => prisma.$disconnect());
