import { canAccessAdmin } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { settingsSchema } from "@/lib/utils/validators";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

const deserialize = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const serialize = (value: unknown) => {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
};

export async function GET() {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const settings = await prisma.settings.findMany({ orderBy: { key: "asc" } });
    const data = settings.reduce<Record<string, unknown>>((acc, setting) => {
      acc[setting.key] = deserialize(setting.value);
      return acc;
    }, {});

    return successResponse(data);
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("GET /api/admin/settings", error);
    return errorResponse("Failed to fetch settings", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const payload = settingsSchema.parse(body);

    const setting = await prisma.settings.upsert({
      where: { key: payload.key },
      update: { value: serialize(payload.value) },
      create: { key: payload.key, value: serialize(payload.value) }
    });

    return successResponse({
      key: setting.key,
      value: deserialize(setting.value)
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.errors.map((e) => e.message).join(", "), 422);
    }
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("POST /api/admin/settings", error);
    return errorResponse("Failed to update settings", 500);
  }
}
