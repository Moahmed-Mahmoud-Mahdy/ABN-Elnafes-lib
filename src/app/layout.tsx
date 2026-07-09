import type { Metadata } from "next";
import { Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import NextAuthProvider from "@/components/providers/next-auth-provider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "مكتبة ابن النفيس | كاتالوج الكتب والأدوات المدرسية والمكتبية",
  description:
    "تصفح كاتالوج مكتبة ابن النفيس - كتب، أدوات مدرسية، أدوات مكتبية، أقلام، دفاتر، أدوات هندسية وفنية، شنط مدرسية، ألعاب تعليمية وهدايا. أسعار تنافسية وجودة مضمونة.",
  keywords: [
    "مكتبة ابن النفيس",
    "كتب",
    "أدوات مدرسية",
    "أدوات مكتبية",
    "أقلام",
    "دفاتر",
    "مكتبة",
    "القاهرة",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${amiri.variable} antialiased bg-background text-foreground`}
      >
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
