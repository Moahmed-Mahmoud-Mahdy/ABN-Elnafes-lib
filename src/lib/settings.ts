import { db } from "@/lib/db";

export type SiteSettings = {
  libraryName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  facebook: string;
  instagram: string;
  workingHours: string;
  aboutTitle: string;
  aboutText: string;
  heroTitle: string;
  heroSubtitle: string;
  whyChoose1Title: string;
  whyChoose1Text: string;
  whyChoose2Title: string;
  whyChoose2Text: string;
  whyChoose3Title: string;
  whyChoose3Text: string;
  whyChoose4Title: string;
  whyChoose4Text: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  libraryName: "مكتبة ابن النفيس",
  phone: "01286183415",
  whatsapp: "+201286183415",
  email: "info@ibnalnafis.com",
  address: "شارع ابن النفيس، شارع جمال  بقرب محطه الهايكستب ، القاهرة، مصر",
  googleMapsUrl: "https://maps.google.com/?q=Cairo,Egypt",
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  workingHours: "السبت - الخميس: 9 صباحاً - 10 مساءً | الجمعة: 2 ظهراً - 10 مساءً",
  aboutTitle: "عن مكتبة ابن النفيس",
  aboutText:
    "مكتبة ابن النفيس هي وجهتك الأولى لجميع احتياجاتك من الكتب والأدوات المدرسية والمكتبية. تأسست المكتبة بخدمة طلاب العلم والمعرفة على مدار سنوات عديدة، ونفخر بتقديم تشكيلة واسعة من المنتجات عالية الجودة بأسعار تنافسية. نحن نؤمن بأن العلم أساس التقدم، لذلك نسعى دائماً لتوفير كل ما يحتاجه الطالب والقارئ في مكان واحد.",
  heroTitle: "كل ما تحتاجه من كتب وأدوات مدرسية ومكتبية",
  heroSubtitle: "تشكيلة واسعة من المنتجات عالية الجودة بأسعار تنافسية - تصفح كاتالوجنا الآن",
  whyChoose1Title: "تشكيلة واسعة",
  whyChoose1Text: "آلاف المنتجات من الكتب والأدوات المدرسية والمكتبية في مكان واحد",
  whyChoose2Title: "أسعار تنافسية",
  whyChoose2Text: "أفضل الأسعار في السوق مع عروض وخصومات مستمرة على مدار العام",
  whyChoose3Title: "جودة مضمونة",
  whyChoose3Text: "نختار منتجاتنا بعناية فائقة من أفضل الموردين والعلامات التجارية",
  whyChoose4Title: "خدمة مميزة",
  whyChoose4Text: "فريق متخصص جاهز لمساعدتك في العثور على ما تحتاجه بسرعة وكفاءة",
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await db.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return { ...DEFAULT_SETTINGS, ...map } as SiteSettings;
}

export async function getSetting(key: keyof SiteSettings): Promise<string> {
  const row = await db.siteSetting.findUnique({ where: { key } });
  return row?.value ?? DEFAULT_SETTINGS[key] ?? "";
}

export async function updateSettings(values: Partial<SiteSettings>) {
  const ops = Object.entries(values).map(([key, value]) =>
    db.siteSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  );
  await Promise.all(ops);
}
