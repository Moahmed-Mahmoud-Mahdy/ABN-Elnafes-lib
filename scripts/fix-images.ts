import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Known-working Unsplash image URLs (library, books, stationery themed)
const IMAGES = [
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
  "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
  "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80",
  "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80",
];

async function main() {
  const images = await prisma.productImage.findMany({ orderBy: { position: "asc" } });
  for (let i = 0; i < images.length; i++) {
    const newUrl = IMAGES[i % IMAGES.length];
    if (images[i].url !== newUrl) {
      await prisma.productImage.update({
        where: { id: images[i].id },
        data: { url: newUrl },
      });
    }
  }
  console.log(`✅ Updated ${images.length} product images to working URLs`);

  // Also fix offer images
  const offers = await prisma.offer.findMany();
  for (let i = 0; i < offers.length; i++) {
    if (offers[i].image) {
      const newUrl = IMAGES[i % IMAGES.length].replace("w=800", "w=1200");
      await prisma.offer.update({
        where: { id: offers[i].id },
        data: { image: newUrl },
      });
    }
  }
  console.log(`✅ Updated ${offers.length} offer images`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
