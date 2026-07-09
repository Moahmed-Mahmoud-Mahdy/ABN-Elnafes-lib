import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "الكتب", icon: "BookOpen", description: "كتب متنوعة في جميع المجالات الدينية والعلمية والأدبية والتعليمية" },
  { name: "الأدوات المدرسية", icon: "Pencil", description: "كل ما يحتاجه الطالب من أدوات مدرسية أساسية ومكملات" },
  { name: "الأدوات المكتبية", icon: "Briefcase", description: "أدوات تنظيم المكتب والملفات ولوازم المكاتب" },
  { name: "الأقلام", icon: "PenTool", description: "أقلام متنوعة - حبر، جل، رصاص، ألوان، إضاءات" },
  { name: "الدفاتر والكراسات", icon: "Notebook", description: "دفاتر وكراسات بمقاسات وعدد أوراق مختلفة" },
  { name: "الأدوات الهندسية", icon: "Ruler", description: "أدوات الرسم الهندسي - مساطر، فرجار، منقلة" },
  { name: "الأدوات الفنية", icon: "Palette", description: "ألوان، فرش، لوحات، وكل مستلزمات الفن" },
  { name: "الشنط المدرسية", icon: "Backpack", description: "شنط مدرسية بمختلف المقاسات والتصاميم" },
  { name: "الألعاب التعليمية", icon: "Puzzle", description: "ألعاب تنمي مهارات الأطفال وتفيدهم تعليمياً" },
  { name: "الهدايا", icon: "Gift", description: "هدايا متميزة لجميع المناسبات" },
];

const PRODUCTS: Array<{
  name: string;
  description: string;
  price: number;
  categoryIdx: number;
  stock: number;
  minStock: number;
  featured?: boolean;
  showInOffers?: boolean;
  images?: string[];
}> = [
  // الكتب (0)
  {
    name: "مصحف الحرمين برواية حفص",
    description: "مصحف شريف بطباعة فاخرة برواية حفص عن عاصم، ورق عالي الجودة، تجليد متين، مقاس مناسب للحمل. مناسب للقراءة اليومية والهدايا.",
    price: 85,
    categoryIdx: 0,
    stock: 120,
    minStock: 20,
    featured: true,
    images: ["https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800"],
  },
  {
    name: "كتاب تفسير ابن كثير - مختصر",
    description: "مختصر تفسير ابن كثير في مجلد واحد، تحقيق علمي دقيق، يقدم خلاصة تفسير القرآن الكريم بأسلوب ميسر لكل قارئ.",
    price: 145,
    categoryIdx: 0,
    stock: 45,
    minStock: 10,
    images: ["https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"],
  },
  {
    name: "رواية ميرامار لنجيب محفوظ",
    description: "رواية ميرامار للأديب نجيب محفوظ الحائز على جائزة نوبل، طبعة أنيقة بغلاف فني، رواية سياسية واجتماعية تدور أحداثها في الإسكندرية.",
    price: 65,
    categoryIdx: 0,
    stock: 8,
    minStock: 10,
    featured: true,
    showInOffers: true,
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"],
  },
  {
    name: "موسوعة العلوم للأطفال",
    description: "موسوعة علمية مصورة للأطفال، 5 مجلدات، شرح مبسط بالصور، تغطي مواضيع الفضاء والحيوانات والتكنولوجيا والطبيعة والجسم البشري.",
    price: 320,
    categoryIdx: 0,
    stock: 25,
    minStock: 5,
    images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"],
  },
  {
    name: "قاموس عربي-إنجليزي المعاصر",
    description: "قاموس عربي إنجليزي ثنائي الاتجاه، شامل ومحدث، يحتوي على أكثر من 100 ألف كلمة ومصطلح، مع نطق الكلمات وأمثلة الاستخدام.",
    price: 180,
    categoryIdx: 0,
    stock: 60,
    minStock: 15,
    images: ["https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800"],
  },

  // الأدوات المدرسية (1)
  {
    name: "طقم أدوات مدرسية كامل - 12 قطعة",
    description: "طقم متكامل للأدوات المدرسية يشمل أقلام رصاص، أقلام حبر، ممحاة، براية، مسطرة، مقص، صمغ، وأدوات هندسية أساسية في علبة منظمة.",
    price: 95,
    categoryIdx: 1,
    stock: 80,
    minStock: 15,
    featured: true,
    showInOffers: true,
    images: ["https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800"],
  },
  {
    name: "كومبليشن فايل (ملف أوراق)",
    description: "ملف تجميع أوراق مقاس A4، 60 شفاف، غلاف بلاستيكي متين، مفهرس بالأرقام، مثالي لتنظيم المستندات والمذكرات.",
    price: 35,
    categoryIdx: 1,
    stock: 200,
    minStock: 30,
    images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"],
  },
  {
    name: "علبة أقلام رصاص HB - 12 قلم",
    description: "علبة أقلام رصاص درجة HB عالية الجودة، مناسب للكتابة والرسم، خشب طبيعي، ممحاة مدمجة، طرف رصاص متين لا ينكسر بسهولة.",
    price: 28,
    categoryIdx: 1,
    stock: 150,
    minStock: 25,
    images: ["https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80"],
  },
  {
    name: "مقلمة مدرسية كرتون",
    description: "مقلمة مدرسية من الكرتون المقوى، مقسمة لداخلين، تصميم ملون جذاب، مثالية لتنظيم الأقلام والأدوات المدرسية الصغيرة.",
    price: 18,
    categoryIdx: 1,
    stock: 5,
    minStock: 20,
    images: ["https://images.unsplash.com/photo-1610498203628-25e6eaff9d6f?w=800"],
  },

  // الأدوات المكتبية (2)
  {
    name: "دباسة مكتبية احترافية",
    description: "دباسة مكتبية معدنية متينة، تستوعب 100 دبوس، قاعدة مطاطية مانعة للانزلاق، مثالية للاستخدام المكثف في المكاتب والمدارس.",
    price: 75,
    categoryIdx: 2,
    stock: 40,
    minStock: 10,
    images: ["https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80"],
  },
  {
    name: "خزانة ملفات معدنية - 4 أدراج",
    description: "خزانة ملفات معدنية بأربعة أدراج، كل درج يستوعب ملفات بحجم letter أو legal، قفل أمان، طلاء مضاد للصدأ، مثالية لتنظيم الأرشيف.",
    price: 1850,
    categoryIdx: 2,
    stock: 12,
    minStock: 3,
    featured: true,
    images: ["https://images.unsplash.com/photo-1568871392488-3ae63127217d?w=800"],
  },
  {
    name: "طقم أقلام تعليمية (ماركر ألوان)",
    description: "طقم ماركر تعليمي بألوان متعددة، 12 لون، حبر سريع الجفاف لا يلطخ، رؤوس فيلت متينة، مناسب للسبورة الورقية والكتابة العامة.",
    price: 45,
    categoryIdx: 2,
    stock: 90,
    minStock: 15,
    images: ["https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80"],
  },

  // الأقلام (3)
  {
    name: "علبة أقلام جل بيكر - 10 أقلام",
    description: "أقلام جل بيكر أزرق، كتابة ناعمة، حبر سريع الجفاف، تصميم أنيق، مناسبة للكتابة اليومية والاختبارات والاجتماعات.",
    price: 42,
    categoryIdx: 3,
    stock: 180,
    minStock: 30,
    featured: true,
    images: ["https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80"],
  },
  {
    name: "قلم حبر باركر Jotter",
    description: "قلم حبر باركر Jotter الأصلي، تصميم كلاسيكي من الستانلس ستيل، كتابة سلسة، حبر أزرق، يأتي في علبة هدايا أنيقة.",
    price: 220,
    categoryIdx: 3,
    stock: 35,
    minStock: 8,
    showInOffers: true,
    images: ["https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80"],
  },
  {
    name: "طقم أقلام رولربول فاخر - 3 أقلام",
    description: "طقم أقلام رولربول فاخر، 3 ألوان (أسود، أزرق، أحمر)، تصميم معدني راقي، صناعة ألمانية، مثالي للهدايا والاستخدام المهني.",
    price: 165,
    categoryIdx: 3,
    stock: 22,
    minStock: 5,
    images: ["https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800"],
  },
  {
    name: "قلم توقيع ذهبي فاخر",
    description: "قلم توقيع ذهبي بمظهر فاخر، كتابة ناعمة وحبر ممتاز، مناسب للتوقيعات الرسمية والمناسبات الهامة، يأتي في علبة مخملية.",
    price: 0,
    categoryIdx: 3,
    stock: 18,
    minStock: 5,
    images: ["https://images.unsplash.com/photo-1583485088034-697b5bc36b92?w=800&q=80"],
  },

  // الدفاتر والكراسات (4)
  {
    name: "دفتر كراسة 100 ورقة سطر",
    description: "دفتر كراسة 100 ورقة، خط سطر عريض، غلاف فني مقوى، ورق أبيض عالي الجودة، مقاس 23×16 سم، مناسب لجميع المراحل الدراسية.",
    price: 15,
    categoryIdx: 4,
    stock: 500,
    minStock: 100,
    featured: true,
    images: ["https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800"],
  },
  {
    name: "دفتر كلاد 200 ورقة مربع",
    description: "دفتر كلاد 200 ورقة بخط مربع 5×5 مم، غلاف بلاستيكي متين، يدوم طوال العام الدراسي، مناسب للرياضيات والعلوم.",
    price: 32,
    categoryIdx: 4,
    stock: 250,
    minStock: 50,
    images: ["https://images.unsplash.com/photo-1517842645767-c639042777db?w=800"],
  },
  {
    name: "مذكرة يومية جلدية A5",
    description: "مذكرة يومية بغلاف جلد طبيعي، مقاس A5، 192 صفحة، تقويم سنوي، أوراق عاجية، حزام مغناطيسي، مثالية للعمل والدراسة.",
    price: 95,
    categoryIdx: 4,
    stock: 60,
    minStock: 15,
    showInOffers: true,
    images: ["https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800"],
  },
  {
    name: "بلوكس رسم 50 ورقة A4",
    description: "بلوك رسم 50 ورقة مقاس A4، ورق أبيض مصقول وزن 120 جرام، مناسب لأقلام الرصاص والألوان والأحبار، غلاف كرتوني مقوى.",
    price: 38,
    categoryIdx: 4,
    stock: 140,
    minStock: 30,
    images: ["https://images.unsplash.com/photo-1517842645767-c639042777db?w=800"],
  },

  // الأدوات الهندسية (5)
  {
    name: "طقم أدوات هندسية - 10 قطع",
    description: "طقم أدوات هندسية كامل، 10 قطع في علبة معدنية، يشمل فرجار، منقلة، مساطر، مثلثات، أقلام رصاص، ممحاة، مناسب لطلاب الهندسة والمدارس.",
    price: 110,
    categoryIdx: 5,
    stock: 50,
    minStock: 10,
    featured: true,
    images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"],
  },
  {
    name: "فرجار هندسي احترافي",
    description: "فرجار هندسي احترافي من الفولاذ المقاوم للصدأ، رأس قابلة للتعديل، مثبت محكم، مناسب للرسم الهندسي الدقيق، يأتي مع قلم رصاص وقطعة تبديل.",
    price: 65,
    categoryIdx: 5,
    stock: 75,
    minStock: 15,
    images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"],
  },
  {
    name: "مسطرة معدنية 30 سم",
    description: "مسطرة معدنية طول 30 سم، علامات حفر دقيقة بالسنتيمتر والمليمتر، حافة غير حادة للاستخدام الآمن، ثقوب للتعليق، متينة وعالية الجودة.",
    price: 22,
    categoryIdx: 5,
    stock: 200,
    minStock: 40,
    images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"],
  },

  // الأدوات الفنية (6)
  {
    name: "طقم ألوان مائية - 24 لون",
    description: "طقم ألوان مائية احترافي، 24 لون متنوع، أصباغ عالية التركيز، تشطيب لامع، يأتي مع فرشاة ولوحة مزج، مناسب للفنانين المحترفين والهواة.",
    price: 145,
    categoryIdx: 6,
    stock: 40,
    minStock: 8,
    featured: true,
    images: ["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"],
  },
  {
    name: "طقم أقلام ألوان خشبية - 36 لون",
    description: "طقم أقلام ألوان خشبية، 36 لون، ألوان زاهية ثابتة، خشب طري سهل البري، مناسب للرسم والتلوين للأطفال والكبار، علبة كرتونية منظمة.",
    price: 85,
    categoryIdx: 6,
    stock: 95,
    minStock: 20,
    images: ["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"],
  },
  {
    name: "لوحة رسم قماش - 40×50 سم",
    description: "لوحة رسم على قماش كتان، مقاس 40×50 سم، مطرزة على إطار خشبي، جاهزة للرسم بالألوان الزيتية والأكريليك، طلاء أبيض تمهيدي مطبق.",
    price: 55,
    categoryIdx: 6,
    stock: 30,
    minStock: 6,
    showInOffers: true,
    images: ["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"],
  },
  {
    name: "طقم فرش رسم - 12 قطعة",
    description: "طقم فرش رسم احترافي، 12 قطعة بمقاسات وأشكال مختلفة، شعيرات صناعية ناعمة، مقابض خشبية مريحة، مناسب لجميع أنواع الألوان.",
    price: 78,
    categoryIdx: 6,
    stock: 55,
    minStock: 12,
    images: ["https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"],
  },

  // الشنط المدرسية (7)
  {
    name: "شنطة مدرسية ظهر - تصميم فضائي",
    description: "شنطة مدرسية خلفية بتصميم فضائي جذاب، 3 أقسام رئيسية، عدة جيوب، حزام خصر، ظهر مبطن مريح، خامة مقاومة للماء، مناسبة لجميع الأعمار.",
    price: 245,
    categoryIdx: 7,
    stock: 45,
    minStock: 10,
    featured: true,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"],
  },
  {
    name: "شنطة مدرسية للبنات - ورود",
    description: "شنطة مدرسية أنيقة للبنات بتصميم الورود، 2 قسم رئيسي، جيب أمامي، أحزمة مريحة مبطنة، خامة عالية الجودة، ألوان زاهية ومبهجة.",
    price: 215,
    categoryIdx: 7,
    stock: 38,
    minStock: 10,
    showInOffers: true,
    images: ["https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800"],
  },
  {
    name: "شنطة لاب توب 15 بوصة",
    description: "شنطة لاب توب احترافية، تتسع لأجهزة 15 بوصة، قسم مبطن للحاسوب، أقسام للملحقات والكتب، حزام كتف قابل للإزالة، تصميم عصري أنيق.",
    price: 185,
    categoryIdx: 7,
    stock: 28,
    minStock: 8,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"],
  },

  // الألعاب التعليمية (8)
  {
    name: "لعبة تركيب صور - 500 قطعة",
    description: "لعبة تركيب صور (بازل) 500 قطعة، صورة طبيعية خلابة، قطع من الكرتون المقوى عالي الجودة، تنمي مهارات التفكير والتركيز، مناسبة من سن 10 سنوات.",
    price: 95,
    categoryIdx: 8,
    stock: 50,
    minStock: 12,
    featured: true,
    images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800"],
  },
  {
    name: "مكعبات رياضية تعليمية",
    description: "مجموعة مكعبات تعليمية ملونة، 100 قطعة، تساعد على تعليم الأرقام والحروف والأشكال والألوان، تنمي المهارات الحركية والذهنية للأطفال.",
    price: 125,
    categoryIdx: 8,
    stock: 65,
    minStock: 15,
    images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800"],
  },
  {
    name: "لعبة الذاكرة - تركيب كلمات",
    description: "لعبة تعليمية لتنمية الذاكرة وتكوين الكلمات، 60 بطاقة، تعلم الحروف وتكوين الكلمات بطريقة ممتعة، مناسبة للأطفال من سن 4 سنوات.",
    price: 55,
    categoryIdx: 8,
    stock: 80,
    minStock: 20,
    images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800"],
  },

  // الهدايا (9)
  {
    name: "صندوق هدية فاخر - ريشة كتابة",
    description: "صندوق هدية أنيق يحتوي على ريشة كتابة فاخرة، زجاجة حبر، دفتر ملاحظات، تصميم كلاسيكي راقي، مثالي كهدايا للمناسبات الخاصة ولعشاق الكتابة.",
    price: 285,
    categoryIdx: 9,
    stock: 20,
    minStock: 5,
    featured: true,
    showInOffers: true,
    images: ["https://images.unsplash.com/photo-1517842645767-c639042777db?w=800"],
  },
  {
    name: "إطار صور خشبي مزخرف - A4",
    description: "إطار صور خشبي بزخارف يدوية، مقاس A4، تصميم كلاسيكي أنيق، خشب طبيعي بنقوش فنية، مثالي لتعليق الصور التذكارية والأعمال الفنية.",
    price: 75,
    categoryIdx: 9,
    stock: 45,
    minStock: 10,
    images: ["https://images.unsplash.com/photo-1517842645767-c639042777db?w=800"],
  },
  {
    name: "مجموعة شموع عطرية فاخرة",
    description: "مجموعة 3 شموع عطرية فاخرة بروائح متعددة (لافندر، فانيليا، صندل)، شمع طبيعي، مدة احتراق طويلة، تأتي في علبة هدايا أنيقة.",
    price: 165,
    categoryIdx: 9,
    stock: 35,
    minStock: 8,
    images: ["https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800"],
  },
];

function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FF\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function main() {
  console.log("🧹 Cleaning existing data...");
  await prisma.stockMovement.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.category.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Creating admin user...");
  const hashed = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@ibnalnafis.com",
      name: "مدير المكتبة",
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log("📚 Creating categories...");
  const cats = [];
  for (const c of CATEGORIES) {
    let slug = slugify(c.name);
    const dup = cats.find((x) => x.slug === slug);
    if (dup) slug = `${slug}-${cats.length}`;
    const cat = await prisma.category.create({
      data: { name: c.name, slug, description: c.description, icon: c.icon },
    });
    cats.push(cat);
  }

  console.log("📦 Creating products...");
  for (const p of PRODUCTS) {
    let slug = slugify(p.name);
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        categoryId: cats[p.categoryIdx].id,
        stock: p.stock,
        minStock: p.minStock,
        featured: !!p.featured,
        showInOffers: !!p.showInOffers,
        active: true,
      },
    });

    if (p.images && p.images.length) {
      await prisma.productImage.createMany({
        data: p.images.map((url, i) => ({
          productId: product.id,
          url,
          position: i,
        })),
      });
    }
  }

  console.log("🏷️ Creating offers...");
  const future = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };
  const past = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  await prisma.offer.createMany({
    data: [
      {
        title: "عرض العودة للمدارس",
        description: "خصومات تصل إلى 25% على جميع الأدوات المدرسية والشنط والدفاتر. عرض محدود لفترة العودة للمدارس - لا يفوتك!",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200",
        discount: "خصم حتى 25%",
        startDate: past(5),
        endDate: future(20),
        active: true,
      },
      {
        title: "وفّر على الكتب الدينية",
        description: "عرض خاص على المصاحف والكتب الدينية - خصومات مميزة على تشكيلة مختارة من الإصدارات الفاخرة.",
        image: "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=1200",
        discount: "خصم 15%",
        startDate: past(2),
        endDate: future(15),
        active: true,
      },
      {
        title: "أدوات فنية بسعر مميز",
        description: "طقم ألوان مائية + فرش رسم + لوحة قماش بسعر مخفض. مثالي للفنانين وطلاب الفنون. الكمية محدودة!",
        image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200",
        discount: "عرض مجمّع بسعر 250 ج.م",
        startDate: past(10),
        endDate: future(8),
        active: true,
      },
      {
        title: "عرض نهاية الأسبوع",
        description: "كل يوم جمعة وسبت - خصم 10% على جميع المنتجات في الفرع. اذكر هذا العرض عند الشراء للحصول على الخصم.",
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200",
        discount: "خصم 10%",
        startDate: past(1),
        endDate: future(60),
        active: true,
      },
    ],
  });

  console.log("⚙️ Creating sample stock movements...");
  const products = await prisma.product.findMany({ take: 5 });
  for (const p of products) {
    await prisma.stockMovement.create({
      data: {
        productId: p.id,
        type: "ADD",
        quantity: 50,
        reason: "توريد افتتاحي",
        userName: "مدير المكتبة",
      },
    });
    await prisma.stockMovement.create({
      data: {
        productId: p.id,
        type: "REMOVE",
        quantity: 5,
        reason: "بيع داخل الفرع",
        userName: "مدير المكتبة",
      },
    });
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Admin credentials:");
  console.log("   Email: admin@ibnalnafis.com");
  console.log("   Password: admin123");
  console.log("\n🌐 Login URL: /admin/login");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
