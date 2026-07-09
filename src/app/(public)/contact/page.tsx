import { getSettings } from "@/lib/settings";
import { Phone, MessageCircle, Mail, MapPin, Clock, Facebook, Instagram } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/public/contact-form";

export default async function ContactPage() {
  const settings = await getSettings();
  const whatsappUrl = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`;

  const contactInfo = [
    {
      icon: Phone,
      label: "الهاتف",
      value: settings.phone,
      href: `tel:${settings.phone}`,
      ltr: true,
    },
    {
      icon: MessageCircle,
      label: "واتساب",
      value: settings.whatsapp,
      href: whatsappUrl,
      ltr: true,
      external: true,
    },
    {
      icon: Mail,
      label: "البريد الإلكتروني",
      value: settings.email,
      href: `mailto:${settings.email}`,
      ltr: true,
    },
    {
      icon: MapPin,
      label: "العنوان",
      value: settings.address,
    },
    {
      icon: Clock,
      label: "ساعات العمل",
      value: settings.workingHours,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
          تواصل معنا
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          نسعد بخدمتك - تواصل معنا عبر أي من الوسائل التالية أو املأ النموذج وسنرد عليك في أقرب وقت
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        {/* Contact info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>معلومات التواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactInfo.map((info, i) => {
                const Icon = info.icon;
                const content = (
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/20 text-accent-foreground flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      <p
                        className="font-medium hover:text-primary transition-colors"
                        dir={info.ltr ? "ltr" : undefined}
                        style={info.ltr ? { textAlign: "right" } : undefined}
                      >
                        {info.value}
                      </p>
                    </div>
                  </div>
                );
                return info.href ? (
                  <a
                    key={i}
                    href={info.href}
                    target={info.external ? "_blank" : undefined}
                    rel={info.external ? "noopener noreferrer" : undefined}
                    className="block hover:bg-secondary/50 -mx-2 p-2 rounded-lg transition-colors"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={i} className="-mx-2 p-2">{content}</div>
                );
              })}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">تابعنا على</p>
                <div className="flex gap-3">
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>الموقع على الخريطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden border">
                <iframe
                  src={settings.googleMapsUrl.replace("/?", "/?output=embed&").replace("maps.google.com", "www.google.com/maps")}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="موقع المكتبة"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact form */}
        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>أرسل لنا رسالة</CardTitle>
          </CardHeader>
          <CardContent>
            <ContactForm settings={settings} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
