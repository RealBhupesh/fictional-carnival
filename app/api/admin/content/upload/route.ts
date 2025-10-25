import { canAccessAdmin } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return errorResponse("No file provided", 400);
    }

    if (!file.type.startsWith("image/")) {
      return errorResponse("Only image uploads are supported", 415);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const extension = path.extname(file.name) || ".png";
    const fileName = `${randomUUID()}${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    const url = `/uploads/${fileName}`;
    return successResponse({ url }, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("POST /api/admin/content/upload", error);
    return errorResponse("Failed to upload image", 500);
  }
}
