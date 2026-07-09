"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SiteSettings } from "@/lib/settings";

export default function ContactForm({ settings }: { settings: SiteSettings }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Since there's no backend email service, we'll send via WhatsApp
    const text = `*رسالة جديدة من الموقع*%0A%0A*الاسم:* ${name}%0A*الهاتف:* ${phone}%0A*البريد:* ${email}%0A*الموضوع:* ${subject}%0A%0A*الرسالة:*%0A${message}`;
    const whatsappUrl = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}?text=${text}`;

    setTimeout(() => {
      setLoading(false);
      window.open(whatsappUrl, "_blank");
      toast.success("سيتم تحويلك إلى واتساب لإرسال الرسالة");
      setName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
    }, 500);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">الاسم *</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك الكامل"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input
            id="phone"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            dir="ltr"
          />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            dir="ltr"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">الموضوع *</Label>
          <Input
            id="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="موضوع الرسالة"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">الرسالة *</Label>
        <Textarea
          id="message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="اكتب رسالتك هنا..."
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12">
        {loading ? "جارٍ الإرسال..." : "إرسال الرسالة"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        سيتم إرسال رسالتك عبر واتساب مباشرة إلى المكتبة
      </p>
    </form>
  );
}
