import Image from "next/image";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { BookOpen, Target, Eye, Award, Heart, TrendingUp, ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [settings, stats] = await Promise.all([
    getSettings(),
    (async () => {
      const [products, categories, offers] = await Promise.all([
        db.product.count({ where: { active: true } }),
        db.category.count(),
        db.offer.count({
          where: {
            active: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        }),
      ]);
      return { products, categories, offers };
    })(),
  ]);

  const values = [
    { icon: TrendingUp, title: settings.whyChoose1Title, text: settings.whyChoose1Text },
    { icon: ShieldCheck, title: settings.whyChoose2Title, text: settings.whyChoose2Text },
    { icon: Sparkles, title: settings.whyChoose3Title, text: settings.whyChoose3Text },
    { icon: HeartHandshake, title: settings.whyChoose4Title, text: settings.whyChoose4Text },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="h-20 w-20 mx-auto rounded-full bg-accent text-accent-foreground flex items-center justify-center mb-4">
            <BookOpen className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-amiri), serif" }}>
            {settings.aboutTitle}
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
            {settings.aboutText}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="text-center bg-card border border-border/60 rounded-xl p-6">
              <p className="text-4xl font-bold text-primary mb-1">{stats.categories}</p>
              <p className="text-sm text-muted-foreground">قسم متنوع</p>
            </div>
            <div className="text-center bg-card border border-border/60 rounded-xl p-6">
              <p className="text-4xl font-bold text-primary mb-1">{stats.products}</p>
              <p className="text-sm text-muted-foreground">منتج متوفر</p>
            </div>
            <div className="text-center bg-card border border-border/60 rounded-xl p-6">
              <p className="text-4xl font-bold text-primary mb-1">{stats.offers}</p>
              <p className="text-sm text-muted-foreground">عرض ساري</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900"
                alt="مكتبة ابن النفيس"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
                قصتنا
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                بدأت رحلة مكتبة ابن النفيس من شغف خدمة طلاب العلم والمعرفة. على مدار سنوات طويلة، تطورت المكتبة من متجر صغير لتصبح وجهة شاملة لكل ما يحتاجه الطلاب والقراء.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                نختار منتجاتنا بعناية فائقة من أفضل الموردين والعلامات التجارية، ونحرص على تقديم أسعار تنافسية وعروض مستمرة. فريقنا المتخصص جاهز دائماً لمساعدتك في العثور على ما تحتاجه بسرعة وكفاءة.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                اسمنا مستوحى من الطبيب والعالم العربي الشهير "ابن النفيس" مكتشف الدورة الدموية الصغرى - رمزاً للمعرفة والإبداع العربي الذي نفتخر به ونسعى لخدمته.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border border-border/60 rounded-2xl p-8">
              <div className="h-14 w-14 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center mb-4">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
                رسالتنا
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                توفير كل ما يحتاجه طلاب العلم والمعرفة من كتب وأدوات مدرسية ومكتبية بأسعار تنافسية وجودة عالية، مع تقديم خدمة متميزة تجعل تجربة التسوق سهلة وممتعة لكل عملائنا.
              </p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-8">
              <div className="h-14 w-14 rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center mb-4">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
                رؤيتنا
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                أن نكون المكتبة الأولى في المنطقة التي يلجأ إليها الطلاب والقراء، وأن نساهم في نشر العلم والثقافة من خلال توفير أفضل المنتجات التعليمية والمكتبية لكل أفراد الأسرة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
              قيمنا
            </h2>
            <p className="text-muted-foreground">المبادئ التي نعمل بها يومياً</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="bg-card border border-border/60 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="h-16 w-16 mx-auto rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
