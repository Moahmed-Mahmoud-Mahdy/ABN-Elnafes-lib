import Image from "next/image";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const [activeOffers, upcomingOffers, settings] = await Promise.all([
    db.offer.findMany({
      where: {
        active: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { endDate: "asc" },
    }),
    db.offer.findMany({
      where: {
        active: true,
        startDate: { gt: new Date() },
      },
      orderBy: { startDate: "asc" },
    }),
    getSettings(),
  ]);

  const whatsappUrl = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <Badge className="bg-accent text-accent-foreground hover:bg-accent mb-3">عروض حصرية</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
          العروض الحالية
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          عروض وخصومات مميزة لفترة محدودة - تواصل معنا أو زور الفرع للاستفادة من العروض
        </p>
      </div>

      {activeOffers.length > 0 ? (
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
            <span className="h-3 w-3 rounded-full bg-green-600 animate-pulse" />
            عروض سارية الآن
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-card border-2 border-accent/40 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {offer.image && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {offer.discount && (
                      <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground hover:bg-accent text-sm">
                        <Tag className="h-3.5 w-3.5 ml-1" />
                        {offer.discount}
                      </Badge>
                    )}
                    <div className="absolute bottom-3 right-3 left-3 text-white">
                      <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
                        {offer.title}
                      </h3>
                    </div>
                  </div>
                )}
                <div className="p-5 space-y-3">
                  {!offer.image && (
                    <div className="flex items-center gap-2">
                      {offer.discount && (
                        <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                          <Tag className="h-3.5 w-3.5 ml-1" />
                          {offer.discount}
                        </Badge>
                      )}
                      <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
                        {offer.title}
                      </h3>
                    </div>
                  )}
                  {offer.description && (
                    <p className="text-muted-foreground leading-relaxed">{offer.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Calendar className="h-4 w-4" />
                    <span>ينتهي في: {formatDate(offer.endDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-border/60 mb-12">
          <p className="text-xl text-muted-foreground">لا توجد عروض سارية حالياً</p>
          <p className="text-sm text-muted-foreground mt-2">تابعنا لمعرفة أحدث العروض</p>
        </div>
      )}

      <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center mb-12">
        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
          استفد من العروض الآن
        </h2>
        <p className="opacity-90 mb-6 max-w-2xl mx-auto">
          العروض متاحة في فرع المكتبة فقط - تواصل معنا أو زورنا للاستفادة من الخصومات
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild size="lg" variant="secondary">
            <a href={`tel:${settings.phone}`}>
              <Phone className="h-5 w-5 ml-2" />
              اتصل بنا
            </a>
          </Button>
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5 ml-2" />
              واتساب
            </a>
          </Button>
        </div>
      </div>

      {upcomingOffers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-amiri), serif" }}>
            عروض قادمة
          </h2>
          <div className="space-y-3">
            {upcomingOffers.map((offer) => (
              <div key={offer.id} className="bg-card border border-border/60 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold">{offer.title}</h3>
                  {offer.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{offer.description}</p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground text-left shrink-0">
                  <p>يبدأ في</p>
                  <p className="font-medium text-foreground">{formatDate(offer.startDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
