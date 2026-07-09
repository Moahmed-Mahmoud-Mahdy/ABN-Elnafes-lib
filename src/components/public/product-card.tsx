import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { getStockStatus, getStockStatusLabel } from "@/lib/stock";

type ProductWithImages = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  stock: number;
  minStock: number;
  featured?: boolean;
  images?: { url: string; position: number }[];
  category?: { name: string };
};

export default function ProductCard({ product }: { product: ProductWithImages }) {
  const status = getStockStatus(product.stock, product.minStock);
  const image = product.images?.[0]?.url;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-card rounded-xl overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-square bg-secondary/40 overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Package className="h-12 w-12" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.featured && (
            <Badge className="bg-accent text-accent-foreground hover:bg-accent shadow-sm">مميز</Badge>
          )}
          {product.category && (
            <Badge variant="secondary" className="bg-card/95 text-card-foreground backdrop-blur shadow-sm">
              {product.category.name}
            </Badge>
          )}
        </div>

        {/* Stock status */}
        <div className="absolute bottom-2 left-2">
          <Badge
            variant={status === "IN_STOCK" ? "default" : status === "LOW_STOCK" ? "secondary" : "destructive"}
            className={
              status === "IN_STOCK"
                ? "bg-green-700 hover:bg-green-700 text-white"
                : status === "LOW_STOCK"
                ? "bg-amber-500 hover:bg-amber-500 text-white"
                : ""
            }
          >
            {getStockStatusLabel(status)}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-1.5">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>
        {product.category && (
          <p className="text-xs text-muted-foreground">{product.category.name}</p>
        )}
        <div className="pt-1.5">
          <p className="font-bold text-primary">{formatPrice(product.price)}</p>
        </div>
      </div>
    </Link>
  );
}
