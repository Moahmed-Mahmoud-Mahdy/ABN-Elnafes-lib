import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import cloudinary from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];
  if (!files.length) {
    return NextResponse.json({ error: "لا توجد ملفات" }, { status: 400 });
  }

  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!file.size) continue;
    const buffer = Buffer.from(await file.arrayBuffer());

    let uploaded = false;

    // Try Cloudinary first if configured
    if (isCloudinaryConfigured()) {
      try {
        const base64 = buffer.toString("base64");
        const dataUri = `data:${file.type || "image/jpeg"};base64,${base64}`;
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: "ibn-al-nafis/products",
          resource_type: "image",
          transformation: [{ width: 1200, quality: "auto", fetch_format: "auto" }],
        });
        urls.push(result.secure_url);
        uploaded = true;
      } catch (e) {
        console.error("Cloudinary upload failed, falling back to local:", e);
        errors.push("Cloudinary upload failed - using local storage");
      }
    }

    // Fallback to local storage if Cloudinary failed or not configured
    if (!uploaded) {
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filename = `${randomUUID()}.${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        urls.push(`/uploads/${filename}`);
      } catch (e) {
        console.error("Local upload also failed:", e);
        errors.push("Failed to save image locally");
      }
    }
  }

  if (urls.length === 0) {
    return NextResponse.json(
      { error: "فشل رفع جميع الصور. حاول مرة أخرى." },
      { status: 500 }
    );
  }

  return NextResponse.json({ urls, warnings: errors.length ? errors : undefined });
}
