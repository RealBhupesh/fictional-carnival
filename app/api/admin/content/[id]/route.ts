import { canAccessAdmin } from "@/lib/auth/permissions";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { errorResponse, successResponse } from "@/lib/utils/api";
import { contentSchema } from "@/lib/utils/validators";
import { NextRequest } from "next/server";
import { ZodError } from "zod";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!content) {
      return errorResponse("Content not found", 404);
    }

    return successResponse(content);
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("GET /api/admin/content/[id]", error);
    return errorResponse("Failed to fetch content", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const payload = contentSchema.partial().parse(body);

    const updated = await prisma.content.update({
      where: { id: params.id },
      data: {
        ...payload,
        publishDate: payload.publishDate ?? undefined
      },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return successResponse(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(error.errors.map((e) => e.message).join(", "), 422);
    }
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("PATCH /api/admin/content/[id]", error);
    return errorResponse("Failed to update content", 500);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const session = await requireSession();
    if (!canAccessAdmin(session.user.role)) {
      return errorResponse("Forbidden", 403);
    }

    await prisma.content.delete({ where: { id: params.id } });

    return successResponse({ deleted: true });
  } catch (error) {
    if ((error as Error).message === "UNAUTHENTICATED") {
      return errorResponse("Unauthorized", 401);
    }
    console.error("DELETE /api/admin/content/[id]", error);
    return errorResponse("Failed to delete content", 500);
  }
}
