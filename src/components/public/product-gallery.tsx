"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="aspect-square bg-secondary/40 rounded-xl flex items-center justify-center text-muted-foreground">
        <Package className="h-20 w-20" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-secondary/30 rounded-xl overflow-hidden border border-border/60">
        <Image
          src={images[active]}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${name} - ${i + 1}`}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
