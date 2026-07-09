import Link from "next/link";
import { BookOpen, Phone, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";

type Category = { id: string; name: string; slug: string };

export default function PublicFooter({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
                {settings.libraryName}
              </h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              وجهتك الأولى لجميع احتياجاتك من الكتب والأدوات المدرسية والمكتبية. تشكيلة واسعة بأسعار تنافسية وجودة مضمونة.
            </p>
            <div className="flex gap-3 pt-2">
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-primary-foreground/15 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-primary-foreground/15 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold mb-4 text-lg" style={{ fontFamily: "var(--font-amiri), serif" }}>روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">الرئيسية</Link></li>
              <li><Link href="/products" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">المنتجات</Link></li>
              <li><Link href="/categories" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">الأقسام</Link></li>
              <li><Link href="/offers" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">العروض</Link></li>
              <li><Link href="/about" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">من نحن</Link></li>
              <li><Link href="/contact" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4 text-lg" style={{ fontFamily: "var(--font-amiri), serif" }}>الأقسام</h4>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="opacity-90 hover:opacity-100 hover:text-accent transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length > 7 && (
                <li>
                  <Link href="/categories" className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">
                    عرض الكل ←
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-lg" style={{ fontFamily: "var(--font-amiri), serif" }}>تواصل معنا</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="opacity-90">{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${settings.phone}`} className="opacity-90 hover:opacity-100 hover:text-accent transition-colors" dir="ltr">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${settings.email}`} className="opacity-90 hover:opacity-100 hover:text-accent transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="opacity-90">{settings.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/15 text-center text-sm opacity-80">
          <p>© {year} {settings.libraryName}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
