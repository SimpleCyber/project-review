import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Determine resource type and format from file
    const fileName = file.name || "";
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const isPdf = ext === "pdf" || file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    // For PDFs: use 'image' resource_type so Cloudinary returns a URL
    // that browsers can render inline. If 'raw' is used, it forces a download.
    const uploadOptions: Record<string, any> = {
      folder: "project-review",
    };

    if (isPdf) {
      uploadOptions.resource_type = "image";
      // We don't strictly need the extension in public_id for 'image', 
      // but it helps keep it organized.
      uploadOptions.public_id = `${Date.now()}_${fileName.replace(/\.pdf$/i, "")}`;
    } else if (isImage) {
      uploadOptions.resource_type = "image";
    } else {
      // For PPTs, DOCX, etc., use raw
      uploadOptions.resource_type = "raw";
      uploadOptions.public_id = `${Date.now()}_${fileName}`;
    }

    const uploadResponse = await cloudinary.uploader.upload(base64, uploadOptions);

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
